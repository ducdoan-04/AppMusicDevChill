TARGET := iphone:clang:9.3:9.3
ARCHS = armv7
INSTALL_TARGET_PROCESSES = ZingMp3iOS

include $(THEOS)/makefiles/common.mk

APPLICATION_NAME = ZingMp3iOS

ZingMp3iOS_FILES = AppDelegate.m Controllers/HomeViewController.m Controllers/MainTabBarController.m Controllers/PlayerViewController.m Controllers/SearchViewController.m Models/Song.m Services/APIService.m Services/AudioPlayer.m
ZingMp3iOS_FRAMEWORKS = UIKit Foundation AVFoundation CoreGraphics
ZingMp3iOS_CFLAGS = -fobjc-arc

include $(THEOS_MAKE_PATH)/application.mk
