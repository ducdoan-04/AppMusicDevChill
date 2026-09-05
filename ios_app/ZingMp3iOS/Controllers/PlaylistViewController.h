#import <UIKit/UIKit.h>
#import "Song.h"

@interface PlaylistViewController : UITableViewController

@property (nonatomic, copy) NSString *playlistId;
@property (nonatomic, copy) NSString *playlistTitle;

@end
