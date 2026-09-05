#import "DataManager.h"

@implementation DataManager

+ (instancetype)sharedManager {
    static DataManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

#pragma mark - Downloaded Songs

- (NSArray<Song *> *)getDownloadedSongs {
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:@"DownloadedSongsData"];
    if (data) {
        NSArray *dicts = [NSKeyedUnarchiver unarchiveObjectWithData:data];
        NSMutableArray *songs = [NSMutableArray array];
        for (NSDictionary *dict in dicts) {
            Song *song = [[Song alloc] initWithDictionary:dict];
            [songs addObject:song];
        }
        return songs;
    }
    return @[];
}

- (void)addDownloadedSong:(Song *)song localPath:(NSString *)path {
    // 1. Add to DownloadedSongsData
    NSMutableArray *songs = [NSMutableArray array];
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:@"DownloadedSongsData"];
    NSMutableArray *dicts = [NSMutableArray array];
    
    if (data) {
        NSArray *existingDicts = [NSKeyedUnarchiver unarchiveObjectWithData:data];
        if (existingDicts) {
            [dicts addObjectsFromArray:existingDicts];
        }
    }
    
    // Check if already exists
    BOOL exists = NO;
    for (NSDictionary *d in dicts) {
        if ([d[@"encodeId"] isEqualToString:song.songId]) {
            exists = YES;
            break;
        }
    }
    
    if (!exists) {
        NSMutableDictionary *songDict = [NSMutableDictionary dictionary];
        if (song.songId) songDict[@"encodeId"] = song.songId;
        if (song.title) songDict[@"title"] = song.title;
        if (song.artistsNames) songDict[@"artistsNames"] = song.artistsNames;
        if (song.thumbnailUrl) songDict[@"thumbnail"] = song.thumbnailUrl;
        
        [dicts addObject:songDict];
        NSData *newData = [NSKeyedArchiver archivedDataWithRootObject:dicts];
        [[NSUserDefaults standardUserDefaults] setObject:newData forKey:@"DownloadedSongsData"];
    }
    
    // 2. Save local path mapping
    NSMutableDictionary *pathsMap = [[[NSUserDefaults standardUserDefaults] dictionaryForKey:@"DownloadedPathsMap"] mutableCopy];
    if (!pathsMap) pathsMap = [NSMutableDictionary dictionary];
    pathsMap[song.songId] = path;
    [[NSUserDefaults standardUserDefaults] setObject:pathsMap forKey:@"DownloadedPathsMap"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSString *)getLocalPathForSongId:(NSString *)songId {
    NSDictionary *pathsMap = [[NSUserDefaults standardUserDefaults] dictionaryForKey:@"DownloadedPathsMap"];
    return pathsMap[songId];
}

#pragma mark - Custom Playlists

- (NSArray<NSString *> *)getCustomPlaylists {
    NSArray *playlists = [[NSUserDefaults standardUserDefaults] arrayForKey:@"CustomPlaylists"];
    if (playlists) {
        return playlists;
    }
    return @[];
}

- (void)createPlaylist:(NSString *)playlistName {
    if (playlistName.length == 0) return;
    
    NSMutableArray *playlists = [[self getCustomPlaylists] mutableCopy];
    if (![playlists containsObject:playlistName]) {
        [playlists addObject:playlistName];
        [[NSUserDefaults standardUserDefaults] setObject:playlists forKey:@"CustomPlaylists"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

- (void)addSong:(Song *)song toPlaylist:(NSString *)playlistName {
    NSString *key = [NSString stringWithFormat:@"Playlist_%@", playlistName];
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:key];
    NSMutableArray *dicts = [NSMutableArray array];
    
    if (data) {
        NSArray *existingDicts = [NSKeyedUnarchiver unarchiveObjectWithData:data];
        if (existingDicts) {
            [dicts addObjectsFromArray:existingDicts];
        }
    }
    
    // Check if already exists
    BOOL exists = NO;
    for (NSDictionary *d in dicts) {
        if ([d[@"encodeId"] isEqualToString:song.songId]) {
            exists = YES;
            break;
        }
    }
    
    if (!exists) {
        NSMutableDictionary *songDict = [NSMutableDictionary dictionary];
        if (song.songId) songDict[@"encodeId"] = song.songId;
        if (song.title) songDict[@"title"] = song.title;
        if (song.artistsNames) songDict[@"artistsNames"] = song.artistsNames;
        if (song.thumbnailUrl) songDict[@"thumbnail"] = song.thumbnailUrl;
        
        [dicts addObject:songDict];
        NSData *newData = [NSKeyedArchiver archivedDataWithRootObject:dicts];
        [[NSUserDefaults standardUserDefaults] setObject:newData forKey:key];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

- (NSArray<Song *> *)getSongsInPlaylist:(NSString *)playlistName {
    NSString *key = [NSString stringWithFormat:@"Playlist_%@", playlistName];
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:key];
    if (data) {
        NSArray *dicts = [NSKeyedUnarchiver unarchiveObjectWithData:data];
        NSMutableArray *songs = [NSMutableArray array];
        for (NSDictionary *dict in dicts) {
            Song *song = [[Song alloc] initWithDictionary:dict];
            [songs addObject:song];
        }
        return songs;
    }
    return @[];
}

@end
