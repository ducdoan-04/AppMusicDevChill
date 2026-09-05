#import <Foundation/Foundation.h>

@interface APIService : NSObject

+ (instancetype)sharedService;

// Change this to your local machine IP where Node backend is running, e.g. @"http://192.168.1.5:5555"
@property (nonatomic, copy) NSString *baseURL;

- (void)fetchHomeDataWithCompletion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchTop100WithCompletion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)searchWithQuery:(NSString *)query completion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchLyricForSongId:(NSString *)songId completion:(void (^)(NSDictionary *data, NSError *error))completion;

@end
