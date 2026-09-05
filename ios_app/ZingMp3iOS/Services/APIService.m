#import "APIService.h"
#import <CommonCrypto/CommonCrypto.h>

#define ZING_VERSION @"1.6.34"
#define ZING_URL @"https://zingmp3.vn"
#define ZING_SECRET_KEY @"2aa2d1c561e809b267f3638c4a307aab"
#define ZING_API_KEY @"88265e23d4284f25963e6eedac8fbfa3"

@interface APIService ()
@property (nonatomic, assign) BOOL hasCookie;
@end

@implementation APIService

+ (instancetype)sharedService {
    static APIService *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (NSString *)getHash256:(NSString *)input {
    const char *cstr = [input UTF8String];
    unsigned char result[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(cstr, (CC_LONG)strlen(cstr), result);
    
    NSMutableString *hexString = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
    for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
        [hexString appendFormat:@"%02x", result[i]];
    }
    return hexString;
}

- (NSString *)getHmac512:(NSString *)input key:(NSString *)key {
    const char *cKey  = [key cStringUsingEncoding:NSUTF8StringEncoding];
    const char *cData = [input cStringUsingEncoding:NSUTF8StringEncoding];
    
    unsigned char cHMAC[CC_SHA512_DIGEST_LENGTH];
    CCHmac(kCCHmacAlgSHA512, cKey, strlen(cKey), cData, strlen(cData), cHMAC);
    
    NSMutableString *hexString = [NSMutableString stringWithCapacity:CC_SHA512_DIGEST_LENGTH * 2];
    for (int i = 0; i < CC_SHA512_DIGEST_LENGTH; i++) {
        [hexString appendFormat:@"%02x", cHMAC[i]];
    }
    return hexString;
}

- (void)ensureCookieWithCompletion:(void (^)(BOOL success))completion {
    if (self.hasCookie) {
        completion(YES);
        return;
    }
    
    NSURL *url = [NSURL URLWithString:ZING_URL];
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (!error) {
            self.hasCookie = YES; // NSURLSession saves cookies automatically
            completion(YES);
        } else {
            completion(NO);
        }
    }];
    [task resume];
}

- (void)performZingRequestWithPath:(NSString *)path params:(NSDictionary *)params sig:(NSString *)sig ctime:(NSString *)ctime completion:(void (^)(NSDictionary *data, NSError *error))completion {
    
    [self ensureCookieWithCompletion:^(BOOL success) {
        NSMutableString *query = [NSMutableString string];
        [query appendFormat:@"ctime=%@&version=%@&apiKey=%@&sig=%@", ctime, ZING_VERSION, ZING_API_KEY, sig];
        
        for (NSString *key in params) {
            NSString *val = params[key];
            NSString *encodedVal = [val stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
            [query appendFormat:@"&%@=%@", key, encodedVal];
        }
        
        NSString *urlString = [NSString stringWithFormat:@"%@%@?%@", ZING_URL, path, query];
        NSURL *url = [NSURL URLWithString:urlString];
        
        NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if (error) {
                dispatch_async(dispatch_get_main_queue(), ^{ completion(nil, error); });
                return;
            }
            if (data) {
                NSError *jsonError = nil;
                NSDictionary *jsonObj = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
                dispatch_async(dispatch_get_main_queue(), ^{ completion(jsonObj, jsonError); });
            } else {
                NSError *err = [NSError errorWithDomain:@"APIService" code:404 userInfo:@{NSLocalizedDescriptionKey: @"No data received"}];
                dispatch_async(dispatch_get_main_queue(), ^{ completion(nil, err); });
            }
        }];
        [task resume];
    }];
}

- (void)fetchHomeDataWithCompletion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/page/get/home";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"count=30ctime=%@page=1version=%@", ctime, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    NSDictionary *params = @{@"page": @"1", @"segmentId": @"-1", @"count": @"30"};
    [self performZingRequestWithPath:path params:params sig:sig ctime:ctime completion:completion];
}

- (void)fetchTop100WithCompletion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/page/get/top-100";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"ctime=%@version=%@", ctime, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    [self performZingRequestWithPath:path params:@{} sig:sig ctime:ctime completion:completion];
}

- (void)searchWithQuery:(NSString *)query completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/search/multi";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"ctime=%@version=%@", ctime, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    NSDictionary *params = @{@"q": query};
    [self performZingRequestWithPath:path params:params sig:sig ctime:ctime completion:completion];
}

- (void)fetchLyricForSongId:(NSString *)songId completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/lyric/get/lyric";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"ctime=%@id=%@version=%@", ctime, songId, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    NSDictionary *params = @{@"id": songId};
    [self performZingRequestWithPath:path params:params sig:sig ctime:ctime completion:completion];
}

- (void)fetchPlaylistDetailForId:(NSString *)playlistId completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/page/get/playlist";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"ctime=%@id=%@version=%@", ctime, playlistId, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    NSDictionary *params = @{@"id": playlistId};
    [self performZingRequestWithPath:path params:params sig:sig ctime:ctime completion:completion];
}

- (void)fetchStreamURLForSongId:(NSString *)songId completion:(void (^)(NSString *streamURL, NSError *error))completion {
    NSString *ctime = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *path = @"/api/v2/song/get/streaming";
    NSString *hash256 = [self getHash256:[NSString stringWithFormat:@"ctime=%@id=%@version=%@", ctime, songId, ZING_VERSION]];
    NSString *sig = [self getHmac512:[NSString stringWithFormat:@"%@%@", path, hash256] key:ZING_SECRET_KEY];
    
    NSDictionary *params = @{@"id": songId};
    [self performZingRequestWithPath:path params:params sig:sig ctime:ctime completion:^(NSDictionary *data, NSError *error) {
        if (error) {
            completion(nil, error);
            return;
        }
        
        NSDictionary *responseData = data[@"data"];
        if ([responseData isKindOfClass:[NSDictionary class]]) {
            NSString *url128 = responseData[@"128"];
            if (url128 && [url128 isKindOfClass:[NSString class]]) {
                completion(url128, nil);
                return;
            }
        }
        completion(nil, [NSError errorWithDomain:@"APIService" code:404 userInfo:@{NSLocalizedDescriptionKey: @"No stream URL found"}]);
    }];
}

@end
