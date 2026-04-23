---
title: "dev: codeblock"
date: 2026-04-23
categories: ["developer"]
tags: ["dev", "typescript"]
---

# 代码块功能

<!--more-->

## test

单行代码
```shell
sudo /Applications/Install\ macOS\ Mojave.app/Contents/Resources/createinstallmedia --volume /Volumes/p1
```

长代码
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setTitle("Secret Location App");
    setContentView(R.layout.activity_main); // 加载布局

    // 权限处理
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this,
                                          new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                                          REQUEST_LOCATION_PERMISSION);
    } else {
        startLocationService();
    }
}
```
