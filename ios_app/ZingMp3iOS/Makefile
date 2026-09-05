TARGET := iphone:clang:14.5:9.3
ARCHS = armv7
INSTALL_TARGET_PROCESSES = ZingMp3iOS

include $(THEOS)/makefiles/common.mk

APPLICATION_NAME = ZingMp3iOS

ZingMp3iOS_FILES = main.m AppDelegate.m Controllers/HomeViewController.m Controllers/MainTabBarController.m Controllers/PlayerViewController.m Controllers/SearchViewController.m Models/Song.m Services/APIService.m Services/AudioPlayer.m
ZingMp3iOS_FRAMEWORKS = UIKit Foundation AVFoundation CoreGraphics MediaPlayer
ZingMp3iOS_CFLAGS = -fobjc-arc -Wno-deprecated-module-dot-map -I. -IControllers -IModels -IServices

include $(THEOS_MAKE_PATH)/application.mk
