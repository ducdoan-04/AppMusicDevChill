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
    self.view.backgroundColor = [UIColor colorWithRed:0.07 green:0.07 blue:0.09 alpha:1.0];
    self.tableView.backgroundColor = [UIColor clearColor];
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    
    self.searchBar = [[UISearchBar alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, 44)];
    self.searchBar.delegate = self;
    self.searchBar.placeholder = @"Tìm bài hát...";
    self.searchBar.barStyle = UIBarStyleBlack;
    self.searchBar.keyboardAppearance = UIKeyboardAppearanceDark;
    self.tableView.tableHeaderView = self.searchBar;
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

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 70.0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"SearchCell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"SearchCell"];
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
    
    Song *song = self.searchResults[indexPath.row];
    cell.textLabel.text = song.title;
    cell.detailTextLabel.text = song.artistsNames;
    
    cell.imageView.image = [UIImage imageNamed:@"placeholder"];
    
    if (song.thumbnail) {
        NSURL *url = [NSURL URLWithString:song.thumbnail];
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

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    Song *selectedSong = self.searchResults[indexPath.row];
    
    [[PlayerViewController sharedPlayerVC] playNewSong:selectedSong];
    self.tabBarController.selectedIndex = 2; // Jump to Player tab
}

@end
