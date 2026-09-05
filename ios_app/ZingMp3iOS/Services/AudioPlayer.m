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
    
    // Construct the stream URL based on backend
    NSString *streamUrlString = [NSString stringWithFormat:@"%@/api/song/stream?id=%@", [APIService sharedService].baseURL, song.songId];
    NSURL *url = [NSURL URLWithString:streamUrlString];
    
    if (self.player) {
        [self.player pause];
        self.player = nil;
    }
    
    self.player = [[AVPlayer alloc] initWithURL:url];
    [self.player play];
    self.isPlaying = YES;
    
    // Setup Audio Session for background playback
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

@end
