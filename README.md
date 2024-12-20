<!-- PROJECT LOGO -->
<br />

<p align="center">
  <a href="https://github.com/klren0312/walrus-library/">
    <img src="docImages/walrus-library-black.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Walrus Library</h3>
  <p align="center">
    一个去中心化的图书分享平台
    <br />
    <br />
    <br />
    <a href="https://walrus-library.walrus.site">查看Demo</a>
    ·
    <a href="https://github.com/klren0312/walrus-library/issues">报告Bug</a>
    ·
    <a href="https://github.com/klren0312/walrus-library/issues">提出新特性</a>
  </p>

</p>


###### **安装步骤**

1. 拉取代码
```sh
git clone https://github.com/klren0312/walrus-library.git
```

2. 安装依赖
```sh
cd walrus-library
pnpm install
```

3. 启动开发环境
```sh
pnpm run dev
```


### 开发的架构 

电子书和封面以及书评markdown使用Walrus存储

其余数据使用Sui合约存储


### 部署

使用 Walrus Site 部署

### 详细功能

#### 1. 用户可以上传书籍（需要mint创作者nft）
> 书籍文件和封面存储于walrus


领取创作者nft

https://github.com/user-attachments/assets/2288df1d-ef1f-437c-8a91-8c0171fd556c


分享书籍

https://github.com/user-attachments/assets/b99f52f2-f6b1-4b5e-89a6-720b1afee9c9



#### 2. 可以预览书籍和下载


https://github.com/user-attachments/assets/32157823-1dc1-4d9b-9c0c-390522a33905




#### 3. 可以发表书评和查看书评
> 书评markdown编辑器支持上传图片到walrus，书评markdown文本存于walrus



https://github.com/user-attachments/assets/edf1fd66-8096-4ab5-a83a-4f9e05935274




#### 4. 捐赠功能
> 存储服务由平台付费，用户可以捐赠指定sui，可在nft中记录捐赠值，方便后续激励

![image](https://github.com/user-attachments/assets/b2a51176-a79a-43ee-8a2f-633c0650e261)


### 作者

ZCDC


### 版权说明

You just DO WHAT THE FUCK YOU WANT TO. [LICENSE.txt](https://github.com/klren0312/walrus-library/blob/master/LICENSE.txt)
