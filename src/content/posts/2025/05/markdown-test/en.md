---
title: "Markdown Test"
publishedAt: 2025-05-23
draft: false
tags: [markdown, test]
---

A document for testing `markdown` syntax.

## Extensions

Use

```md
==peek==
```

The effect is ==peek==

> Quote here

> [!note]
> Note here

> [!tip] title
> Title can be included

> [!warning]
> Warning here

> [!important]
> Important here

> [!caution]
> Caution here

## Pictures

```markdown
![alt](./path/to/image.jpg "title"){width=xx layout=grid}
```

![pixel width](./assets/endfield.jpg "pixel width"){width=240px}

![relative width](./assets/bloodwolf.webp "relative width"){width=18rem}

![](./assets/endfield_bg1.jpg){width=42% layout=grid}

![](./assets/endfield_bg2.jpg){width=42% layout=grid}

![](./assets/endfield_bg3.jpg)

![](./assets/endfield_bg4.jpg){width=42% layout=grid}

![](./assets/endfield_bg5.jpg){width=42% layout=grid}

## Code blocks

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
