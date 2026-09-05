#import "AudioPlayer.h"
#import "APIService.h"
#import "DataManager.h"
#import <UIKit/UIKit.h>

@interface AudioPlayer ()

@property (nonatomic, strong) AVPlayer *player;
@property (nonatomic, strong) Song *currentSong;
@property (nonatomic, assign) BOOL isPlaying;

@end

@implementation AudioPlayer

+ (instancetype)sharedPlayer {
    static AudioPlayer *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (void)playSong:(Song *)song {
    self.currentSong = song;
    
    if (self.player) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:AVPlayerItemDidPlayToEndTimeNotification object:self.player.currentItem];
        [self.player pause];
        self.player = nil;
    }
    
    self.isPlaying = NO;
    
    NSString *localFile = [[DataManager sharedManager] getLocalPathForSongId:song.songId];
    if (localFile) {
        NSString *docsDir = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
        NSString *fullPath = [docsDir stringByAppendingPathComponent:localFile];
        NSURL *localURL = [NSURL fileURLWithPath:fullPath];
        
        self.player = [[AVPlayer alloc] initWithURL:localURL];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(itemDidFinishPlaying:) name:AVPlayerItemDidPlayToEndTimeNotification object:self.player.currentItem];
        [self.player play];
        self.isPlaying = YES;
        [self setupAudioSession];
    } else {
        UIBackgroundTaskIdentifier __block bgTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
            [[UIApplication sharedApplication] endBackgroundTask:bgTask];
            bgTask = UIBackgroundTaskInvalid;
        }];
        
        [[APIService sharedService] fetchStreamURLForSongId:song.songId completion:^(NSString *streamURL, NSError *error) {
            if (!error && streamURL) {
                NSURL *url = [NSURL URLWithString:streamURL];
                self.player = [[AVPlayer alloc] initWithURL:url];
                [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(itemDidFinishPlaying:) name:AVPlayerItemDidPlayToEndTimeNotification object:self.player.currentItem];
                [self.player play];
                self.isPlaying = YES;
                [self setupAudioSession];
            } else {
                NSLog(@"Failed to get stream URL: %@", error);
            }
            
            if (bgTask != UIBackgroundTaskInvalid) {
                [[UIApplication sharedApplication] endBackgroundTask:bgTask];
                bgTask = UIBackgroundTaskInvalid;
            }
        }];
    }
}

- (void)setupAudioSession {
    NSError *sessionError = nil;
    [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:&sessionError];
    [[AVAudioSession sharedInstance] setActive:YES error:nil];
}

- (void)pause {
    [self.player pause];
    self.isPlaying = NO;
}

- (void)resume {
    [self.player play];
    self.isPlaying = YES;
}

- (void)seekToTime:(NSTimeInterval)time {
    CMTime cmTime = CMTimeMakeWithSeconds(time, 1);
    [self.player seekToTime:cmTime];
}

- (void)itemDidFinishPlaying:(NSNotification *)notification {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"AudioPlayerDidFinishPlaying" object:nil];
}

- (CGFloat)getDuration {
    if (self.player && self.player.currentItem) {
        Float64 dur = CMTimeGetSeconds(self.player.currentItem.duration);
        return isnan(dur) ? 0 : dur;
    }
    return 0;
}

- (CGFloat)getCurrentTime {
    if (self.player) {
        Float64 cur = CMTimeGetSeconds(self.player.currentTime);
        return isnan(cur) ? 0 : cur;
    }
    return 0;
}

@end
