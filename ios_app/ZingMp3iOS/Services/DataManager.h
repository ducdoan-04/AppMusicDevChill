#import <Foundation/Foundation.h>
#import "Song.h"

@interface DataManager : NSObject

+ (instancetype)sharedManager;

// Downloaded Songs
- (NSArray<Song *> *)getDownloadedSongs;
- (void)addDownloadedSong:(Song *)song localPath:(NSString *)path;
- (NSString *)getLocalPathForSongId:(NSString *)songId;

// Custom Playlists
- (NSArray<NSString *> *)getCustomPlaylists;
- (void)createPlaylist:(NSString *)playlistName;
- (void)addSong:(Song *)song toPlaylist:(NSString *)playlistName;
- (NSArray<Song *> *)getSongsInPlaylist:(NSString *)playlistName;

@end
