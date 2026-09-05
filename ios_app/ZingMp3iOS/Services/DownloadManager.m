#import "DownloadManager.h"
#import "APIService.h"
#import "DataManager.h"

@implementation DownloadManager

+ (instancetype)sharedManager {
    static DownloadManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (void)downloadSong:(Song *)song progress:(void (^)(float progress))progressBlock completion:(void (^)(BOOL success, NSError *error))completion {
    // 1. Get Stream URL
    [[APIService sharedService] fetchStreamURLForSongId:song.songId completion:^(NSString *streamURL, NSError *error) {
        if (error || !streamURL) {
            dispatch_async(dispatch_get_main_queue(), ^{ completion(NO, error); });
            return;
        }
        
        // 2. Download file
        NSURL *url = [NSURL URLWithString:streamURL];
        NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
        NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
        
        NSURLSessionDownloadTask *downloadTask = [session downloadTaskWithURL:url completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
            if (error) {
                dispatch_async(dispatch_get_main_queue(), ^{ completion(NO, error); });
                return;
            }
            
            // 3. Move file to Documents directory
            NSString *docsDir = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
            NSString *fileName = [NSString stringWithFormat:@"%@.mp3", song.songId];
            NSString *destPath = [docsDir stringByAppendingPathComponent:fileName];
            NSURL *destURL = [NSURL fileURLWithPath:destPath];
            
            NSFileManager *fileManager = [NSFileManager defaultManager];
            if ([fileManager fileExistsAtPath:destPath]) {
                [fileManager removeItemAtPath:destPath error:nil];
            }
            
            NSError *moveError = nil;
            [fileManager moveItemAtURL:location toURL:destURL error:&moveError];
            
            if (moveError) {
                dispatch_async(dispatch_get_main_queue(), ^{ completion(NO, moveError); });
            } else {
                // Save to DataManager
                [[DataManager sharedManager] addDownloadedSong:song localPath:fileName];
                dispatch_async(dispatch_get_main_queue(), ^{ completion(YES, nil); });
            }
        }];
        
        [downloadTask resume];
    }];
}

@end
