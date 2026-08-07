---
title: "Markdown 测试文档"
publishedAt: 2025-05-23
draft: false
tags: [markdown, test]
---

用于测试 `markdown` 语法的文档。

## 扩展

可以使用

```md
==看看==
```

效果为 ==看看==

> 这里进行引用

> [!note]
> 这里是一个注意事项

> [!tip] 标题
> 可以有标题

> [!warning]
> 这里是一个警告

> [!important]
> 这里是一个重要事项

> [!caution]
> 这里是一个小心事项

## 图片

```markdown
![alt](./path/to/image.jpg "title"){width=xx layout=grid}
```

![像素宽度](./assets/endfield.jpg "像素宽度"){width=240px}

![相对宽度](./assets/bloodwolf.webp "相对宽度"){width=18rem}

![](./assets/endfield_bg1.jpg){width=42% layout=grid}

![](./assets/endfield_bg2.jpg){width=42% layout=grid}

![](./assets/endfield_bg3.jpg)

![](./assets/endfield_bg4.jpg){width=42% layout=grid}

![](./assets/endfield_bg5.jpg){width=42% layout=grid}

## 代码块

```python
def hello_world():
    print("Hello, World!")
```

```rust
fn main() {
    println!("Hello, World!");
}
```

```go
package main

func main() {
    fmt.Println("Hello, World!")
}
```
