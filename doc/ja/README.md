# Router API

Riot Routeerは最もミニマルなルータの実装であり、​​IE9を含むすべてのブラウザで一貫して動作します。このルータはURLハッシュ(`#`のあとに続く部分)の変化のみを検知します。ほとんどのシングルページアプリケーション(SPA)はハッシュのみを扱いますが、もしURL全体を扱う必要があれば、他のルータ実装を使うべきです。

Riot Routerは、`#`に続く部分についてルートの階層構造を`/`で分けているなら、最適なルーティングスキームです。その場合、Riotはその(URLの)部分に直接のアクセスを提供します。


### router(callback) | #router

URLハッシュが変更されると、与えられた`callback`を実行します。こんな感じです。

```javascript
router(function(collection, id, action) {

})
```

もし、例えばハッシュが`#customers/987987/edit`に変わったとすると、上の例の引数は次のようになるでしょう。


```javascript
collection = 'customers'
id = '987987'
action = 'edit'
```

ハッシュは次のような方法で変更することが可能です。

1.新しいハッシュが、ロケーションバーに入力された
2.戻る/進むボタンが押されたとき
3.`router(to)`が呼び出されたとき

### router.start() | #router-start

ウィンドウのハッシュ変更の検知を開始します。これは、Riotが読み込まれた際に自動的に呼び出されます。[route.stop](#route-stop)と合わせて使うのが典型的です。次はその例です。

```javascript
router.stop() // clear all the old router callbacks
router.start() // start again
```

### router.stop() | #router-stop

ハッシュ変更検知を停止して、[route.route](#route)コールバックもクリアします。

```javascript
router.stop()
```

デフォルトルーターを停止しておけば、アプリケーションで別のルータを使うことも可能です。

### router(to) | #route-to

ブラウザのURLを変更して、`router(callback)`で登録されたすべてのリスナに通知します。例:

```javascript
router('customers/267393/edit')
```

### router.exec(callback) | #route-exec

現在のハッシュを調べて、与えられた`callback`をハッシュ変更なしに「その場で」実行します。こんな感じです。

```javascript
router.exec(function(collection, id, action) {

})
```

### router.parser(parser) | #route-parser

デフォルトパーサーを独自のものに変更します。これは、こんなパスを解析するための例です。

`!/user/activation?token=xyz`

```javascript
router.parser(function(path) {
  var raw = path.slice(2).split('?'),
      uri = raw[0].split('/'),
      qs = raw[1],
      params = {}

  if (qs) {
    qs.split('&').forEach(function(v) {
      var c = v.split('=')
      params[c[0]] = c[1]
    })
  }

  uri.push(params)
  return uri
})
```

そして、これがURLが変更された場合に受け取るだろうパラメータです。

```
router(function(target, action, params) {

  /*
    target = 'user'
    action = 'activation'
    params = { token: 'xyz' }
  */

})
```