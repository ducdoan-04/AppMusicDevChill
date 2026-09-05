#import <UIKit/UIKit.h>
#import "Song.h"

@interface PlayerViewController : UIViewController

+ (instancetype)sharedPlayerVC;
- (void)playNewSong:(Song *)song playlist:(NSArray<Song *> *)playlist currentIndex:(NSInteger)index;

@end
