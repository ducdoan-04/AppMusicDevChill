#import "PlaylistViewController.h"
#import "APIService.h"
#import "DataManager.h"
#import "PlayerViewController.h"
#import "DownloadManager.h"

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
        
        UIView *accessoryView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 80, 40)];
        UIButton *addButton = [UIButton buttonWithType:UIButtonTypeCustom];
        addButton.frame = CGRectMake(0, 0, 40, 40);
        [addButton setTitle:@"➕" forState:UIControlStateNormal];
        [addButton addTarget:self action:@selector(addTapped:) forControlEvents:UIControlEventTouchUpInside];
        [accessoryView addSubview:addButton];
        
        UIButton *downButton = [UIButton buttonWithType:UIButtonTypeCustom];
        downButton.frame = CGRectMake(40, 0, 40, 40);
        [downButton setTitle:@"⬇️" forState:UIControlStateNormal];
        [downButton addTarget:self action:@selector(downTapped:) forControlEvents:UIControlEventTouchUpInside];
        [accessoryView addSubview:downButton];
        
        cell.accessoryView = accessoryView;
    }
    
    Song *song = self.songs[indexPath.row];
    cell.textLabel.text = song.title;
    cell.detailTextLabel.text = song.artistsNames;
    
    if (cell.accessoryView && cell.accessoryView.subviews.count >= 2) {
        UIButton *btn1 = cell.accessoryView.subviews[0];
        UIButton *btn2 = cell.accessoryView.subviews[1];
        btn1.tag = indexPath.row;
        btn2.tag = indexPath.row;
    }
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

- (void)addTapped:(UIButton *)sender {
    NSInteger index = sender.tag;
    if (index < 0 || index >= self.songs.count) return;
    Song *song = self.songs[index];
    
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Thêm vào Playlist" message:@"Chọn playlist hoặc tạo mới" preferredStyle:UIAlertControllerStyleActionSheet];
    
    NSArray *playlists = [[DataManager sharedManager] getCustomPlaylists];
    for (NSString *pName in playlists) {
        UIAlertAction *action = [UIAlertAction actionWithTitle:pName style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            [[DataManager sharedManager] addSong:song toPlaylist:pName];
            [self showToast:@"Đã thêm vào playlist!"];
        }];
        [alert addAction:action];
    }
    
    UIAlertAction *newAction = [UIAlertAction actionWithTitle:@"Tạo mới..." style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        UIAlertController *inputAlert = [UIAlertController alertControllerWithTitle:@"Playlist mới" message:@"Nhập tên playlist" preferredStyle:UIAlertControllerStyleAlert];
        [inputAlert addTextFieldWithConfigurationHandler:nil];
        UIAlertAction *saveAction = [UIAlertAction actionWithTitle:@"Tạo" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            NSString *name = inputAlert.textFields.firstObject.text;
            if (name.length > 0) {
                [[DataManager sharedManager] createPlaylist:name];
                [[DataManager sharedManager] addSong:song toPlaylist:name];
                [self showToast:@"Đã tạo và thêm bài hát!"];
            }
        }];
        [inputAlert addAction:saveAction];
        [inputAlert addAction:[UIAlertAction actionWithTitle:@"Huỷ" style:UIAlertActionStyleCancel handler:nil]];
        [self presentViewController:inputAlert animated:YES completion:nil];
    }];
    [alert addAction:newAction];
    
    [alert addAction:[UIAlertAction actionWithTitle:@"Huỷ" style:UIAlertActionStyleCancel handler:nil]];
    
    if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
        alert.popoverPresentationController.sourceView = sender;
        alert.popoverPresentationController.sourceRect = sender.bounds;
        alert.popoverPresentationController.permittedArrowDirections = UIPopoverArrowDirectionAny;
    }
    
    [self presentViewController:alert animated:YES completion:nil];
}

- (void)downTapped:(UIButton *)sender {
    NSInteger index = sender.tag;
    if (index < 0 || index >= self.songs.count) return;
    Song *song = self.songs[index];
    
    [self showToast:@"Đang tải..."];
    [[DownloadManager sharedManager] downloadSong:song progress:nil completion:^(BOOL success, NSError *error) {
        if (success) {
            [self showToast:@"Tải thành công!"];
        } else {
            [self showToast:@"Tải thất bại!"];
        }
    }];
}

- (void)showToast:(NSString *)message {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:message preferredStyle:UIAlertControllerStyleAlert];
    [self presentViewController:alert animated:YES completion:^{
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [alert dismissViewControllerAnimated:YES completion:nil];
        });
    }];
}

@end
