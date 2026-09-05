#import "PlayerViewController.h"
#import "AudioPlayer.h"
#import "APIService.h"

@interface PlayerViewController ()

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
    self.titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, 100, self.view.frame.size.width - 40, 30)];
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    self.titleLabel.font = [UIFont boldSystemFontOfSize:20];
    self.titleLabel.text = @"No Song Playing";
    [self.view addSubview:self.titleLabel];
    
    self.artistLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, 140, self.view.frame.size.width - 40, 20)];
    self.artistLabel.textAlignment = NSTextAlignmentCenter;
    self.artistLabel.font = [UIFont systemFontOfSize:16];
    self.artistLabel.textColor = [UIColor darkGrayColor];
    [self.view addSubview:self.artistLabel];
    
    self.playPauseButton = [UIButton buttonWithType:UIButtonTypeSystem];
    self.playPauseButton.frame = CGRectMake((self.view.frame.size.width - 100)/2, 180, 100, 50);
    [self.playPauseButton setTitle:@"Play" forState:UIControlStateNormal];
    self.playPauseButton.titleLabel.font = [UIFont boldSystemFontOfSize:18];
    [self.playPauseButton addTarget:self action:@selector(playPauseTapped) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:self.playPauseButton];
    
    self.lyricTextView = [[UITextView alloc] initWithFrame:CGRectMake(20, 250, self.view.frame.size.width - 40, self.view.frame.size.height - 350)];
    self.lyricTextView.editable = NO;
    self.lyricTextView.font = [UIFont systemFontOfSize:14];
    [self.view addSubview:self.lyricTextView];
}

- (void)playNewSong:(Song *)song {
    self.titleLabel.text = song.title;
    self.artistLabel.text = song.artistsNames;
    [self.playPauseButton setTitle:@"Pause" forState:UIControlStateNormal];
    
    [[AudioPlayer sharedPlayer] playSong:song];
    
    self.lyricTextView.text = @"Loading lyrics...";
    
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
        [self.playPauseButton setTitle:@"Play" forState:UIControlStateNormal];
    } else {
        [[AudioPlayer sharedPlayer] resume];
        [self.playPauseButton setTitle:@"Pause" forState:UIControlStateNormal];
    }
}

@end
