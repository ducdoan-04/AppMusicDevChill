#import "LibraryViewController.h"
#import "DataManager.h"
#import "PlaylistViewController.h"

@interface LibraryViewController ()

@property (nonatomic, strong) NSArray *customPlaylists;

@end

@implementation LibraryViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"Thư Viện";
    self.view.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.customPlaylists = [[DataManager sharedManager] getCustomPlaylists];
    [self.tableView reloadData];
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 2;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if (section == 0) return @"Nhạc Đã Tải";
    return @"Playlist Của Tôi";
}

- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section {
    if ([view isKindOfClass:[UITableViewHeaderFooterView class]]) {
        UITableViewHeaderFooterView *header = (UITableViewHeaderFooterView *)view;
        header.textLabel.textColor = [UIColor whiteColor];
        header.contentView.backgroundColor = [UIColor colorWithRed:0.05 green:0.05 blue:0.07 alpha:1.0];
    }
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section == 0) return 1;
    return self.customPlaylists.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *cellId = @"LibraryCell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellId];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellId];
        cell.backgroundColor = [UIColor clearColor];
        cell.textLabel.textColor = [UIColor whiteColor];
        cell.textLabel.font = [UIFont boldSystemFontOfSize:16];
        
        UIView *selectedView = [[UIView alloc] init];
        selectedView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.1];
        cell.selectedBackgroundView = selectedView;
        
        cell.imageView.contentMode = UIViewContentModeScaleAspectFill;
        cell.imageView.clipsToBounds = YES;
        cell.imageView.layer.cornerRadius = 5.0;
    }
    
    if (indexPath.section == 0) {
        cell.textLabel.text = @"Bài Hát Đã Tải";
        cell.imageView.image = [UIImage imageNamed:@"placeholder"]; // Ideally a download icon
    } else {
        cell.textLabel.text = self.customPlaylists[indexPath.row];
        cell.imageView.image = [UIImage imageNamed:@"placeholder"]; // Ideally a playlist icon
    }
    
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 70;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    PlaylistViewController *playlistVC = [[PlaylistViewController alloc] init];
    if (indexPath.section == 0) {
        playlistVC.playlistTitle = @"Bài Hát Đã Tải";
        playlistVC.isLocalPlaylist = YES;
        playlistVC.localPlaylistName = @"Downloaded";
    } else {
        NSString *name = self.customPlaylists[indexPath.row];
        playlistVC.playlistTitle = name;
        playlistVC.isLocalPlaylist = YES;
        playlistVC.localPlaylistName = name;
    }
    [self.navigationController pushViewController:playlistVC animated:YES];
}

@end
