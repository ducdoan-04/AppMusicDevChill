#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import "Song.h"

@interface AudioPlayer : NSObject

+ (instancetype)sharedPlayer;

@property (nonatomic, strong, readonly) AVPlayer *player;
@property (nonatomic, strong, readonly) Song *currentSong;
@property (nonatomic, assign, readonly) BOOL isPlaying;

- (void)playSong:(Song *)song;
- (void)pause;
- (void)resume;
- (void)seekToTime:(NSTimeInterval)time;

@end
