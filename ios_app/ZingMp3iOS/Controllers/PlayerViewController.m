#import "PlayerViewController.h"
#import "AudioPlayer.h"
#import "APIService.h"

@interface PlayerViewController ()

@property (nonatomic, strong) UIImageView *backgroundImageView;
@property (nonatomic, strong) UIVisualEffectView *blurEffectView;
@property (nonatomic, strong) UIImageView *coverImageView;
@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) UILabel *artistLabel;
@property (nonatomic, strong) UIButton *playPauseButton;
@property (nonatomic, strong) UITextView *lyricTextView;

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
    self.view.backgroundColor = [UIColor whiteColor];
    
    [self setupUI];
}

- (void)setupUI {
    // 1. Background Image (will be blurred)
    self.backgroundImageView = [[UIImageView alloc] initWithFrame:self.view.bounds];
    self.backgroundImageView.contentMode = UIViewContentModeScaleAspectFill;
    self.backgroundImageView.backgroundColor = [UIColor colorWithRed:0.05 green:0.05 blue:0.07 alpha:1.0];
    [self.view addSubview:self.backgroundImageView];
    
    // 2. Blur Effect
    UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleDark];
    self.blurEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
    self.blurEffectView.frame = self.view.bounds;
    [self.view addSubview:self.blurEffectView];
    
    // 3. Cover Image (Large, Rounded)
    CGFloat coverSize = self.view.frame.size.width - 60;
    self.coverImageView = [[UIImageView alloc] initWithFrame:CGRectMake(30, 80, coverSize, coverSize)];
    self.coverImageView.contentMode = UIViewContentModeScaleAspectFill;
    self.coverImageView.layer.cornerRadius = 15.0;
    self.coverImageView.layer.masksToBounds = YES;
    self.coverImageView.backgroundColor = [UIColor colorWithWhite:0.2 alpha:1.0];
    [self.view addSubview:self.coverImageView];
    
    // 4. Title Label
    self.titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(30, CGRectGetMaxY(self.coverImageView.frame) + 30, coverSize, 30)];
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    self.titleLabel.font = [UIFont boldSystemFontOfSize:22];
    self.titleLabel.textColor = [UIColor whiteColor];
    self.titleLabel.text = @"Chưa có bài hát";
    [self.view addSubview:self.titleLabel];
    
    // 5. Artist Label
    self.artistLabel = [[UILabel alloc] initWithFrame:CGRectMake(30, CGRectGetMaxY(self.titleLabel.frame) + 5, coverSize, 20)];
    self.artistLabel.textAlignment = NSTextAlignmentCenter;
    self.artistLabel.font = [UIFont systemFontOfSize:16];
    self.artistLabel.textColor = [UIColor colorWithWhite:0.8 alpha:1.0];
    self.artistLabel.text = @"Vui lòng chọn bài hát";
    [self.view addSubview:self.artistLabel];
    
    // 6. Play/Pause Button
    self.playPauseButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.playPauseButton.frame = CGRectMake((self.view.frame.size.width - 70)/2, CGRectGetMaxY(self.artistLabel.frame) + 30, 70, 70);
    self.playPauseButton.backgroundColor = [UIColor colorWithRed:0.6 green:0.2 blue:0.8 alpha:1.0]; // Tím Zing
    self.playPauseButton.layer.cornerRadius = 35.0;
    [self.playPauseButton setTitle:@"▶️" forState:UIControlStateNormal];
    self.playPauseButton.titleLabel.font = [UIFont systemFontOfSize:30];
    [self.playPauseButton addTarget:self action:@selector(playPauseTapped) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.playPauseButton];
    
    // 7. Lyrics
    self.lyricTextView = [[UITextView alloc] initWithFrame:CGRectMake(20, CGRectGetMaxY(self.playPauseButton.frame) + 30, self.view.frame.size.width - 40, self.view.frame.size.height - CGRectGetMaxY(self.playPauseButton.frame) - 100)];
    self.lyricTextView.editable = NO;
    self.lyricTextView.backgroundColor = [UIColor clearColor];
    self.lyricTextView.textColor = [UIColor colorWithWhite:1.0 alpha:0.6];
    self.lyricTextView.font = [UIFont systemFontOfSize:15];
    self.lyricTextView.textAlignment = NSTextAlignmentCenter;
    [self.view addSubview:self.lyricTextView];
}

- (void)playNewSong:(Song *)song {
    self.titleLabel.text = song.title;
    self.artistLabel.text = song.artistsNames;
    [self.playPauseButton setTitle:@"⏸" forState:UIControlStateNormal];
    
    // Load cover art
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
    
    self.lyricTextView.text = @"Đang tải lời bài hát...";
    
    [[APIService sharedService] fetchLyricForSongId:song.songId completion:^(NSDictionary *data, NSError *error) {
        if (!error && data) {
            // Simplified lyric handling
            // The real API returns an array of sentences with words. For simplicity here:
            self.lyricTextView.text = @"Lyrics found, processing not fully implemented in this demo.\n(Check debug logs for raw lyric data)";
        } else {
            self.lyricTextView.text = @"No lyrics available.";
        }
    }];
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

@end
