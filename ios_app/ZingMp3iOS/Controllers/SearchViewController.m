#import "SearchViewController.h"
#import "APIService.h"
#import "Song.h"
#import "PlayerViewController.h"

@interface SearchViewController () <UISearchBarDelegate>

@property (nonatomic, strong) UISearchBar *searchBar;
@property (nonatomic, strong) NSArray<Song *> *searchResults;

@end

@implementation SearchViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    
    self.searchBar = [[UISearchBar alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, 44)];
    self.searchBar.delegate = self;
    self.searchBar.placeholder = @"Search songs...";
    self.tableView.tableHeaderView = self.searchBar;
    
    [self.tableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"SearchCell"];
}

- (void)searchBarSearchButtonClicked:(UISearchBar *)searchBar {
    [searchBar resignFirstResponder];
    
    NSString *query = searchBar.text;
    if (query.length == 0) return;
    
    [[APIService sharedService] searchWithQuery:query completion:^(NSDictionary *data, NSError *error) {
        if (!error && data) {
            NSDictionary *responseData = data[@"data"];
            NSArray *songDicts = responseData[@"songs"]; // multi search returns songs array inside data
            
            NSMutableArray *parsedSongs = [NSMutableArray array];
            for (NSDictionary *dict in songDicts) {
                Song *song = [[Song alloc] initWithDictionary:dict];
                if (song.songId) {
                    [parsedSongs addObject:song];
                }
            }
            
            self.searchResults = parsedSongs;
            [self.tableView reloadData];
        } else {
            NSLog(@"Error searching: %@", error);
        }
    }];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.searchResults.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"SearchCell" forIndexPath:indexPath];
    
    Song *song = self.searchResults[indexPath.row];
    cell.textLabel.text = [NSString stringWithFormat:@"%@ - %@", song.title, song.artistsNames];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    Song *selectedSong = self.searchResults[indexPath.row];
    
    [[PlayerViewController sharedPlayerVC] playNewSong:selectedSong];
    self.tabBarController.selectedIndex = 2; // Jump to Player tab
}

@end
