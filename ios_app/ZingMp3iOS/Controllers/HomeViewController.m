#import "HomeViewController.h"
#import "APIService.h"
#import "Song.h"
#import "PlayerViewController.h"

@interface HomeViewController ()

@property (nonatomic, strong) NSArray<Song *> *songs;

@end

@implementation HomeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundView = nil;
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    
    // Use Subtitle style to show Title + Artist
    // Cannot register Class for Subtitle style, so we will create it in cellForRowAtIndexPath
    
    [self fetchTop100];
}

- (void)fetchTop100 {
    [[APIService sharedService] fetchTop100WithCompletion:^(NSDictionary *data, NSError *error) {
        if (!error && data) {
            NSArray *items = data[@"data"];
            if ([items isKindOfClass:[NSArray class]] && items.count > 0) {
                // The Top100 API returns a list of genres, each having songs.
                // Let's just pick the first genre's songs for simplicity.
                NSDictionary *firstGenre = items.firstObject;
                NSArray *songDicts = firstGenre[@"items"];
                
                NSMutableArray *parsedSongs = [NSMutableArray array];
                for (NSDictionary *dict in songDicts) {
                    Song *song = [[Song alloc] initWithDictionary:dict];
                    if (song.songId) {
                        [parsedSongs addObject:song];
                    }
                }
                
                self.songs = parsedSongs;
                [self.tableView reloadData];
            }
        } else {
            NSLog(@"Error fetching Top100: %@", error);
        }
    }];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.songs.count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 70.0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"Cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"Cell"];
        cell.backgroundColor = [UIColor clearColor];
        
        UIView *bgColorView = [[UIView alloc] init];
        bgColorView.backgroundColor = [UIColor colorWithWhite:0.2 alpha:0.5];
        cell.selectedBackgroundView = bgColorView;
        
        cell.textLabel.textColor = [UIColor whiteColor];
        cell.textLabel.font = [UIFont boldSystemFontOfSize:16.0];
        
        cell.detailTextLabel.textColor = [UIColor lightGrayColor];
        cell.detailTextLabel.font = [UIFont systemFontOfSize:13.0];
        
        cell.imageView.contentMode = UIViewContentModeScaleAspectFill;
        cell.imageView.layer.cornerRadius = 8.0;
        cell.imageView.layer.masksToBounds = YES;
    }
    
    Song *song = self.songs[indexPath.row];
    cell.textLabel.text = song.title;
    cell.detailTextLabel.text = song.artistsNames;
    
    // Placeholder while loading image
    cell.imageView.image = [UIImage imageNamed:@"placeholder"]; // If nil, it just won't show initially
    
    if (song.thumbnailUrl) {
        NSURL *url = [NSURL URLWithString:song.thumbnailUrl];
        // Simple async image loading
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData *data = [NSData dataWithContentsOfURL:url];
            if (data) {
                UIImage *image = [UIImage imageWithData:data];
                dispatch_async(dispatch_get_main_queue(), ^{
                    // Check if cell is still displaying the same song
                    UITableViewCell *updateCell = [tableView cellForRowAtIndexPath:indexPath];
                    if (updateCell) {
                        updateCell.imageView.image = image;
                        [updateCell setNeedsLayout]; // Force layout to resize image properly
                    }
                });
            }
        });
    }
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    Song *selectedSong = self.songs[indexPath.row];
    
    [[PlayerViewController sharedPlayerVC] playNewSong:selectedSong playlist:self.songs currentIndex:indexPath.row];
    self.tabBarController.selectedIndex = 2; // Jump to Player tab
}

@end
