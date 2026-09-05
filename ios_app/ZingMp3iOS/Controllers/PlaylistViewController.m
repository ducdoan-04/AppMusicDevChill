#import "PlaylistViewController.h"
#import "APIService.h"
#import "PlayerViewController.h"

@interface PlaylistViewController ()

@property (nonatomic, strong) NSMutableArray<Song *> *songs;

@end

@implementation PlaylistViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = self.playlistTitle;
    self.view.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundView = nil;
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    
    self.songs = [NSMutableArray array];
    
    [self loadPlaylistData];
}

- (void)loadPlaylistData {
    if (self.isLocalPlaylist) {
        if ([self.localPlaylistName isEqualToString:@"Downloaded"]) {
            self.songs = [[[DataManager sharedManager] getDownloadedSongs] mutableCopy];
        } else {
            self.songs = [[[DataManager sharedManager] getSongsInPlaylist:self.localPlaylistName] mutableCopy];
        }
        [self.tableView reloadData];
    } else {
        [[APIService sharedService] fetchPlaylistDetailForId:self.playlistId completion:^(NSDictionary *data, NSError *error) {
            if (!error && data) {
                NSDictionary *responseData = data[@"data"];
                NSDictionary *songSection = responseData[@"song"];
                NSArray *items = songSection[@"items"];
                
                if ([items isKindOfClass:[NSArray class]]) {
                    for (NSDictionary *dict in items) {
                        Song *song = [[Song alloc] initWithDictionary:dict];
                        [self.songs addObject:song];
                    }
                    [self.tableView reloadData];
                }
            }
        }];
    }
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.songs.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *cellId = @"SongCell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellId];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:cellId];
        cell.backgroundColor = [UIColor clearColor];
        cell.textLabel.textColor = [UIColor whiteColor];
        cell.textLabel.font = [UIFont boldSystemFontOfSize:16];
        cell.detailTextLabel.textColor = [UIColor lightGrayColor];
        
        UIView *selectedView = [[UIView alloc] init];
        selectedView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.1];
        cell.selectedBackgroundView = selectedView;
        
        cell.imageView.contentMode = UIViewContentModeScaleAspectFill;
        cell.imageView.clipsToBounds = YES;
        cell.imageView.layer.cornerRadius = 5.0;
    }
    
    Song *song = self.songs[indexPath.row];
    cell.textLabel.text = song.title;
    cell.detailTextLabel.text = song.artistsNames;
    cell.imageView.image = [UIImage imageNamed:@"placeholder"];
    
    if (song.thumbnailUrl) {
        NSURL *url = [NSURL URLWithString:song.thumbnailUrl];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData *data = [NSData dataWithContentsOfURL:url];
            if (data) {
                UIImage *image = [UIImage imageWithData:data];
                dispatch_async(dispatch_get_main_queue(), ^{
                    UITableViewCell *updateCell = [tableView cellForRowAtIndexPath:indexPath];
                    if (updateCell) {
                        updateCell.imageView.image = image;
                        [updateCell setNeedsLayout];
                    }
                });
            }
        });
    }
    
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 70;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    Song *selectedSong = self.songs[indexPath.row];
    
    [[PlayerViewController sharedPlayerVC] playNewSong:selectedSong playlist:self.songs currentIndex:indexPath.row];
    self.tabBarController.selectedIndex = 2; // Jump to Player tab
}

@end
