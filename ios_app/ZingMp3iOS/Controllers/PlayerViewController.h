#import <UIKit/UIKit.h>
#import "Song.h"

@interface PlayerViewController : UIViewController

+ (instancetype)sharedPlayerVC;
- (void)playNewSong:(Song *)song;

@end
