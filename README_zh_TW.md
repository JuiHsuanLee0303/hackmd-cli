# HackMD CLI

HackMD 的 CLI 工具，讓你可以直接從終端機管理你的筆記。

[English](README.md)

## 安裝

### 使用 npm ( 尚未發布 )

```bash
npm install -g hackmd-cli
```

### 使用 git

```bash
git clone git@github.com:JuiHsuanLee0303/hackmd-cli.git
cd hackmd-cli
npm install
npm link
```

## 認證

1. 前往 [HackMD 設定](https://hackmd.io/settings#api) 並建立 API 金鑰
2. 執行登入命令：

```bash
hackmd login
```

## 使用

### 簡易使用

1. 列出所有筆記

   - 列出筆記標題與 ID

   ```bash
   hackmd list
   ```

   - 列出筆記詳細資訊

   ```bash
   hackmd list -v
   ```

   - 列出筆記特定欄位為參數
     - `-t` 標題
     - `-C` 內容
     - `-a` 作者
     - `-d` 創建時間
     - `-m` 上次修改時間
     - `-i` ID
     - `-r` 閱讀權限
     - `-w` 寫入權限
     - `-c` 評論權限

2. 下載筆記

   - 下載單一筆記

   ```bash
   hackmd fetch <note-id>
   ```

   - 下載所有筆記

   ```bash
   hackmd fetch --all
   ```

3. 新增筆記

   - 利用參數新增筆記

   ```bash
   hackmd new -t <Title> -C <Content> -r <readPermission> -w <writePermission> -c <commentPermission>
   ```

   - 互動模式新增筆記

   ```bash
   hackmd new
   ```

   - 將本地筆記新增到 HackMD

   ```bash
   hackmd new -f <filename>
   ```

4. 編輯筆記

   - 利用參數編輯筆記

   ```bash
   hackmd edit <note-id> -t <Title> -C <Content> -r <readPermission> -w <writePermission> -c <commentPermission>
   ```

   - 互動模式編輯筆記

   ```bash
   hackmd edit
   ```

   - 將本地筆記編輯到 HackMD

   ```bash
   hackmd edit -f <filename>
   ```

5. 刪除筆記

   ```bash
   hackmd delete <note-id>
   ```

6. 下載筆記

   ```bash
   hackmd download <note-id> -o <output-path>
   ```

   output-path 為選填，若未填寫則會下載到當前目錄

### 遠端同步

遠端同步的使用方式類似`git`，可以將本地筆記推送到遠端，或是從遠端拉取筆記到本地。

首先先在本地初始化一個 hackmd 倉庫

```bash
hackmd init
```

接下來將遠端筆記的 ID 加入到本地倉庫

```bash
hackmd remote add <local-name> <note-id>
```

可用`hackmd remote -v`查看目前連結的遠端筆記

```bash
hackmd remote -v
```

也可以用`hackmd remote remove <local-name>`移除遠端筆記

```bash
hackmd remote remove <local-name>
```

接下來可以用`hackmd pull`將遠端筆記拉取到本地

```bash
hackmd pull <local-name>
```

如果未指定本地倉庫名稱，則會將所有遠端筆記拉取到本地

也可以用`hackmd push`將本地筆記推送到遠端

```bash
hackmd push <local-name>
```

如果未指定本地倉庫名稱，則會將所有本地筆記推送到遠端
