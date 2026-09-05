#import <Foundation/Foundation.h>

@interface APIService : NSObject

+ (instancetype)sharedService;

- (void)fetchHomeDataWithCompletion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchTop100WithCompletion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)searchWithQuery:(NSString *)query completion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchLyricForSongId:(NSString *)songId completion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchPlaylistDetailForId:(NSString *)playlistId completion:(void (^)(NSDictionary *data, NSError *error))completion;
- (void)fetchStreamURLForSongId:(NSString *)songId completion:(void (^)(NSString *streamURL, NSError *error))completion;

@end
