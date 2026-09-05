#import "MainTabBarController.h"
#import "HomeViewController.h"
#import "SearchViewController.h"
#import "PlayerViewController.h"
#import "LibraryViewController.h"

@interface MainTabBarController ()

@end

@implementation MainTabBarController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    HomeViewController *homeVC = [[HomeViewController alloc] init];
    homeVC.title = @"Khám Phá";
    UINavigationController *homeNav = [[UINavigationController alloc] initWithRootViewController:homeVC];
    homeNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Khám Phá" image:nil tag:0];
    
    SearchViewController *searchVC = [[SearchViewController alloc] init];
    searchVC.title = @"Tìm Kiếm";
    UINavigationController *searchNav = [[UINavigationController alloc] initWithRootViewController:searchVC];
    searchNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Tìm Kiếm" image:nil tag:1];
    
    PlayerViewController *playerVC = [PlayerViewController sharedPlayerVC];
    playerVC.title = @"Đang Phát";
    UINavigationController *playerNav = [[UINavigationController alloc] initWithRootViewController:playerVC];
    playerNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Đang Phát" image:nil tag:2];
    
    LibraryViewController *libVC = [[LibraryViewController alloc] init];
    libVC.title = @"Thư Viện";
    UINavigationController *libNav = [[UINavigationController alloc] initWithRootViewController:libVC];
    libNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Thư Viện" image:nil tag:3];
    
    self.viewControllers = @[homeNav, searchNav, playerNav, libNav];
    
    // Đổi màu TabBar sang Dark Mode
    self.tabBar.barStyle = UIBarStyleBlack;
    self.tabBar.translucent = YES;
    self.tabBar.tintColor = [UIColor colorWithRed:0.6 green:0.2 blue:0.8 alpha:1.0]; // Màu tím Zing
    
    // Đổi màu NavigationBar sang Dark Mode
    [[UINavigationBar appearance] setBarStyle:UIBarStyleBlack];
    [[UINavigationBar appearance] setTranslucent:YES];
    [[UINavigationBar appearance] setTintColor:[UIColor colorWithRed:0.6 green:0.2 blue:0.8 alpha:1.0]];
}

@end
