#import "AudioPlayer.h"
#import "APIService.h"

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
    
    [[APIService sharedService] fetchStreamURLForSongId:song.songId completion:^(NSString *streamURL, NSError *error) {
        if (!error && streamURL) {
            NSURL *url = [NSURL URLWithString:streamURL];
            self.player = [[AVPlayer alloc] initWithURL:url];
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(itemDidFinishPlaying:) name:AVPlayerItemDidPlayToEndTimeNotification object:self.player.currentItem];
            [self.player play];
            self.isPlaying = YES;
            
            // Setup Audio Session for background playback
            NSError *sessionError = nil;
            [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:&sessionError];
            [[AVAudioSession sharedInstance] setActive:YES error:nil];
        } else {
            NSLog(@"Failed to get stream URL: %@", error);
        }
    }];
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
