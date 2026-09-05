#import <Foundation/Foundation.h>
#import "Song.h"

@interface DownloadManager : NSObject

+ (instancetype)sharedManager;

- (void)downloadSong:(Song *)song progress:(void (^)(float progress))progressBlock completion:(void (^)(BOOL success, NSError *error))completion;

@end
