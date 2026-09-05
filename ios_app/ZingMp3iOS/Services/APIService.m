#import "APIService.h"

@implementation APIService

+ (instancetype)sharedService {
    static APIService *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
        sharedInstance.baseURL = @"http://192.168.1.100:5555"; // Placeholder, replace with actual IP
    });
    return sharedInstance;
}

- (void)performGETRequestWithPath:(NSString *)path completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *urlString = [NSString stringWithFormat:@"%@%@", self.baseURL, path];
    // Encode url string to handle spaces in search query
    urlString = [urlString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    
    NSURL *url = [NSURL URLWithString:urlString];
    if (!url) {
        NSError *err = [NSError errorWithDomain:@"APIService" code:400 userInfo:@{NSLocalizedDescriptionKey: @"Invalid URL"}];
        completion(nil, err);
        return;
    }
    
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        
        if (error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                completion(nil, error);
            });
            return;
        }
        
        if (data) {
            NSError *jsonError = nil;
            NSDictionary *jsonObj = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
            dispatch_async(dispatch_get_main_queue(), ^{
                completion(jsonObj, jsonError);
            });
        } else {
            NSError *err = [NSError errorWithDomain:@"APIService" code:404 userInfo:@{NSLocalizedDescriptionKey: @"No data received"}];
            dispatch_async(dispatch_get_main_queue(), ^{
                completion(nil, err);
            });
        }
    }];
    
    [task resume];
}

- (void)fetchHomeDataWithCompletion:(void (^)(NSDictionary *data, NSError *error))completion {
    [self performGETRequestWithPath:@"/api/home" completion:completion];
}

- (void)fetchTop100WithCompletion:(void (^)(NSDictionary *data, NSError *error))completion {
    [self performGETRequestWithPath:@"/api/top100" completion:completion];
}

- (void)searchWithQuery:(NSString *)query completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *path = [NSString stringWithFormat:@"/api/search?q=%@", query];
    [self performGETRequestWithPath:path completion:completion];
}

- (void)fetchLyricForSongId:(NSString *)songId completion:(void (^)(NSDictionary *data, NSError *error))completion {
    NSString *path = [NSString stringWithFormat:@"/api/lyric?id=%@", songId];
    [self performGETRequestWithPath:path completion:completion];
}

@end
