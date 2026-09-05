#import "MainTabBarController.h"
#import "HomeViewController.h"
#import "SearchViewController.h"
#import "PlayerViewController.h"

@interface MainTabBarController ()

@end

@implementation MainTabBarController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    HomeViewController *homeVC = [[HomeViewController alloc] init];
    homeVC.title = @"Home";
    UINavigationController *homeNav = [[UINavigationController alloc] initWithRootViewController:homeVC];
    homeNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Home" image:nil tag:0];
    
    SearchViewController *searchVC = [[SearchViewController alloc] init];
    searchVC.title = @"Search";
    UINavigationController *searchNav = [[UINavigationController alloc] initWithRootViewController:searchVC];
    searchNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Search" image:nil tag:1];
    
    PlayerViewController *playerVC = [PlayerViewController sharedPlayerVC];
    playerVC.title = @"Now Playing";
    UINavigationController *playerNav = [[UINavigationController alloc] initWithRootViewController:playerVC];
    playerNav.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Player" image:nil tag:2];
    
    self.viewControllers = @[homeNav, searchNav, playerNav];
    self.tabBar.translucent = NO;
}

@end
