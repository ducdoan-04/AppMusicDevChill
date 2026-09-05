#import "Song.h"

@implementation Song

- (instancetype)initWithDictionary:(NSDictionary *)dict {
    self = [super init];
    if (self) {
        _songId = dict[@"encodeId"];
        _title = dict[@"title"];
        _artistsNames = dict[@"artistsNames"];
        _thumbnailUrl = dict[@"thumbnailM"];
    }
    return self;
}

@end
