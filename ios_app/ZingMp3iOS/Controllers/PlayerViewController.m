#import "PlayerViewController.h"
#import "AudioPlayer.h"
#import "APIService.h"
#import <MediaPlayer/MediaPlayer.h>

@interface PlayerViewController ()

@property (nonatomic, strong) UIImageView *backgroundImageView;
@property (nonatomic, strong) UIVisualEffectView *blurEffectView;
@property (nonatomic, strong) UIImageView *coverImageView;
@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) UILabel *artistLabel;

// Playback controls
@property (nonatomic, strong) UISlider *timeSlider;
@property (nonatomic, strong) UILabel *currentTimeLabel;
@property (nonatomic, strong) UILabel *durationLabel;
@property (nonatomic, strong) UIButton *prevButton;
@property (nonatomic, strong) UIButton *playPauseButton;
@property (nonatomic, strong) UIButton *nextButton;
@property (nonatomic, strong) MPVolumeView *volumeView;

// Playlist state
@property (nonatomic, strong) NSArray<Song *> *currentPlaylist;
@property (nonatomic, assign) NSInteger currentIndex;
@property (nonatomic, strong) Song *currentSong;

// Lyric
@property (nonatomic, strong) UITextView *lyricTextView;
@property (nonatomic, strong) NSTimer *progressTimer;
@property (nonatomic, assign) BOOL isUserScrubbing;

@end

@implementation PlayerViewController

+ (instancetype)sharedPlayerVC {
    static PlayerViewController *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:0.05 green:0.05 blue:0.07 alpha:1.0];
    
    [self setupUI];
    
    // Notification for auto-next
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleSongEnded) name:@"AudioPlayerDidFinishPlaying" object:nil];
}

- (void)setupUI {
    CGFloat screenWidth = self.view.frame.size.width;
    
    // 1. Background Image
    self.backgroundImageView = [[UIImageView alloc] initWithFrame:self.view.bounds];
    self.backgroundImageView.contentMode = UIViewContentModeScaleAspectFill;
    self.backgroundImageView.backgroundColor = [UIColor colorWithRed:0.05 green:0.05 blue:0.07 alpha:1.0];
    [self.view addSubview:self.backgroundImageView];
    
    // 2. Blur Effect
    UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleDark];
    self.blurEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
    self.blurEffectView.frame = self.view.bounds;
    [self.view addSubview:self.blurEffectView];
    
    // 3. Cover Image
    CGFloat coverSize = screenWidth - 60;
    if (coverSize > 320) coverSize = 320; // Giới hạn kích thước tối đa cho iPad
    CGFloat coverX = (screenWidth - coverSize) / 2;
    self.coverImageView = [[UIImageView alloc] initWithFrame:CGRectMake(coverX, 80, coverSize, coverSize)];
    self.coverImageView.contentMode = UIViewContentModeScaleAspectFill;
    self.coverImageView.layer.cornerRadius = 15.0;
    self.coverImageView.layer.masksToBounds = YES;
    self.coverImageView.backgroundColor = [UIColor colorWithWhite:0.2 alpha:1.0];
    [self.view addSubview:self.coverImageView];
    
    // 4. Labels
    self.titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(30, CGRectGetMaxY(self.coverImageView.frame) + 30, screenWidth - 60, 30)];
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    self.titleLabel.font = [UIFont boldSystemFontOfSize:22];
    self.titleLabel.textColor = [UIColor whiteColor];
    self.titleLabel.text = @"Chưa có bài hát";
    [self.view addSubview:self.titleLabel];
    
    self.artistLabel = [[UILabel alloc] initWithFrame:CGRectMake(30, CGRectGetMaxY(self.titleLabel.frame) + 5, screenWidth - 60, 20)];
    self.artistLabel.textAlignment = NSTextAlignmentCenter;
    self.artistLabel.font = [UIFont systemFontOfSize:16];
    self.artistLabel.textColor = [UIColor colorWithWhite:0.8 alpha:1.0];
    self.artistLabel.text = @"Vui lòng chọn bài hát";
    [self.view addSubview:self.artistLabel];
    
    // 5. Timeline Slider
    CGFloat sliderY = CGRectGetMaxY(self.artistLabel.frame) + 20;
    self.timeSlider = [[UISlider alloc] initWithFrame:CGRectMake(50, sliderY, screenWidth - 100, 30)];
    self.timeSlider.minimumTrackTintColor = [UIColor colorWithRed:0.6 green:0.2 blue:0.8 alpha:1.0];
    self.timeSlider.maximumTrackTintColor = [UIColor colorWithWhite:1.0 alpha:0.3];
    [self.timeSlider addTarget:self action:@selector(sliderTouchBegan:) forControlEvents:UIControlEventTouchDown];
    [self.timeSlider addTarget:self action:@selector(sliderTouchEnded:) forControlEvents:UIControlEventTouchUpInside | UIControlEventTouchUpOutside];
    [self.timeSlider addTarget:self action:@selector(sliderValueChanged:) forControlEvents:UIControlEventValueChanged];
    [self.view addSubview:self.timeSlider];
    
    self.currentTimeLabel = [[UILabel alloc] initWithFrame:CGRectMake(10, sliderY, 40, 30)];
    self.currentTimeLabel.font = [UIFont systemFontOfSize:12];
    self.currentTimeLabel.textColor = [UIColor whiteColor];
    self.currentTimeLabel.text = @"0:00";
    self.currentTimeLabel.textAlignment = NSTextAlignmentCenter;
    [self.view addSubview:self.currentTimeLabel];
    
    self.durationLabel = [[UILabel alloc] initWithFrame:CGRectMake(screenWidth - 50, sliderY, 40, 30)];
    self.durationLabel.font = [UIFont systemFontOfSize:12];
    self.durationLabel.textColor = [UIColor whiteColor];
    self.durationLabel.text = @"0:00";
    self.durationLabel.textAlignment = NSTextAlignmentCenter;
    [self.view addSubview:self.durationLabel];
    
    // 6. Controls
    CGFloat controlY = CGRectGetMaxY(self.timeSlider.frame) + 15;
    
    self.prevButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.prevButton.frame = CGRectMake((screenWidth / 2) - 100, controlY + 15, 40, 40);
    [self.prevButton setTitle:@"⏮" forState:UIControlStateNormal];
    self.prevButton.titleLabel.font = [UIFont systemFontOfSize:30];
    [self.prevButton addTarget:self action:@selector(playPrev) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.prevButton];
    
    self.playPauseButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.playPauseButton.frame = CGRectMake((screenWidth - 70)/2, controlY, 70, 70);
    self.playPauseButton.backgroundColor = [UIColor colorWithRed:0.6 green:0.2 blue:0.8 alpha:1.0];
    self.playPauseButton.layer.cornerRadius = 35.0;
    [self.playPauseButton setTitle:@"▶️" forState:UIControlStateNormal];
    self.playPauseButton.titleLabel.font = [UIFont systemFontOfSize:30];
    [self.playPauseButton addTarget:self action:@selector(playPauseTapped) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.playPauseButton];
    
    self.nextButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.nextButton.frame = CGRectMake((screenWidth / 2) + 60, controlY + 15, 40, 40);
    [self.nextButton setTitle:@"⏭" forState:UIControlStateNormal];
    self.nextButton.titleLabel.font = [UIFont systemFontOfSize:30];
    [self.nextButton addTarget:self action:@selector(playNext) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.nextButton];
    
    // 7. Volume
    self.volumeView = [[MPVolumeView alloc] initWithFrame:CGRectMake(30, CGRectGetMaxY(self.playPauseButton.frame) + 30, screenWidth - 60, 20)];
    self.volumeView.tintColor = [UIColor whiteColor];
    [self.view addSubview:self.volumeView];
}

- (void)playNewSong:(Song *)song playlist:(NSArray<Song *> *)playlist currentIndex:(NSInteger)index {
    [self view]; // Bắt buộc LoadView nếu chưa load
    
    self.currentSong = song;
    self.currentPlaylist = playlist;
    self.currentIndex = index;
    
    self.titleLabel.text = song.title;
    self.artistLabel.text = song.artistsNames;
    [self.playPauseButton setTitle:@"⏸" forState:UIControlStateNormal];
    
    if (song.thumbnailUrl) {
        NSURL *url = [NSURL URLWithString:song.thumbnailUrl];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData *data = [NSData dataWithContentsOfURL:url];
            if (data) {
                UIImage *image = [UIImage imageWithData:data];
                dispatch_async(dispatch_get_main_queue(), ^{
                    self.coverImageView.image = image;
                    self.backgroundImageView.image = image;
                });
            }
        });
    } else {
        self.coverImageView.image = nil;
        self.backgroundImageView.image = nil;
    }
    
    [[AudioPlayer sharedPlayer] playSong:song];
    [self startProgressTimer];
}

- (void)playPauseTapped {
    if ([AudioPlayer sharedPlayer].isPlaying) {
        [[AudioPlayer sharedPlayer] pause];
        [self.playPauseButton setTitle:@"▶️" forState:UIControlStateNormal];
    } else {
        [[AudioPlayer sharedPlayer] resume];
        [self.playPauseButton setTitle:@"⏸" forState:UIControlStateNormal];
    }
}

- (void)playNext {
    if (self.currentPlaylist.count == 0) return;
    
    NSInteger nextIndex = self.currentIndex + 1;
    if (nextIndex >= self.currentPlaylist.count) {
        nextIndex = 0; // Vòng lặp
    }
    
    Song *nextSong = self.currentPlaylist[nextIndex];
    [self playNewSong:nextSong playlist:self.currentPlaylist currentIndex:nextIndex];
}

- (void)playPrev {
    if (self.currentPlaylist.count == 0) return;
    
    NSInteger prevIndex = self.currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = self.currentPlaylist.count - 1; // Vòng lặp
    }
    
    Song *prevSong = self.currentPlaylist[prevIndex];
    [self playNewSong:prevSong playlist:self.currentPlaylist currentIndex:prevIndex];
}

- (void)handleSongEnded {
    [self playNext];
}

#pragma mark - Timeline Slider
- (void)startProgressTimer {
    if (self.progressTimer) {
        [self.progressTimer invalidate];
    }
    self.progressTimer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(updateProgress) userInfo:nil repeats:YES];
}

- (void)updateProgress {
    if (self.isUserScrubbing) return;
    
    CGFloat duration = [[AudioPlayer sharedPlayer] getDuration];
    CGFloat currentTime = [[AudioPlayer sharedPlayer] getCurrentTime];
    
    if (duration > 0) {
        self.timeSlider.maximumValue = duration;
        self.timeSlider.value = currentTime;
        self.durationLabel.text = [self formatTime:duration];
        self.currentTimeLabel.text = [self formatTime:currentTime];
    }
}

- (void)sliderTouchBegan:(UISlider *)slider {
    self.isUserScrubbing = YES;
}

- (void)sliderTouchEnded:(UISlider *)slider {
    self.isUserScrubbing = NO;
    [[AudioPlayer sharedPlayer] seekToTime:slider.value];
}

- (void)sliderValueChanged:(UISlider *)slider {
    self.currentTimeLabel.text = [self formatTime:slider.value];
}

- (NSString *)formatTime:(CGFloat)timeInSeconds {
    int minutes = floor(timeInSeconds / 60);
    int seconds = round(timeInSeconds - (minutes * 60));
    return [NSString stringWithFormat:@"%d:%02d", minutes, seconds];
}

@end
