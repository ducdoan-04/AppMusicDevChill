#import <Foundation/Foundation.h>

@interface Song : NSObject

@property (nonatomic, copy) NSString *songId;
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *artistsNames;
@property (nonatomic, copy) NSString *thumbnailUrl;

- (instancetype)initWithDictionary:(NSDictionary *)dict;

@end
