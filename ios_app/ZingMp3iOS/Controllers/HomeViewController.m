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
    self.view.backgroundColor = [UIColor whiteColor];
    [self.tableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"Cell"];
    
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

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"Cell" forIndexPath:indexPath];
    
    Song *song = self.songs[indexPath.row];
    cell.textLabel.text = [NSString stringWithFormat:@"%@ - %@", song.title, song.artistsNames];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    Song *selectedSong = self.songs[indexPath.row];
    
    [[PlayerViewController sharedPlayerVC] playNewSong:selectedSong];
    self.tabBarController.selectedIndex = 2; // Jump to Player tab
}

@end
