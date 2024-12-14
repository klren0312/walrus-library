module contract::walrus_library;
use std::string::{String, utf8};
use sui::event::{Self};
use sui::package::{claim};
use sui::display::{new_with_fields, update_version};

public struct WALRUS_LIBRARY has drop {}

public struct BookServer has key, store {
  id: UID,
  total_book_size: u64,
  total_book_number: u64,
  total_member_number: u64,
}

public struct Book has key, store {
  id: UID,
  cover_blob_id: String,
  title: String,
  author: String,
  description: String,
  blob_id: String,
  creator: address,
  size: u64,
}

public struct BookCreatorNft has key, store {
  id: UID,
  name: String,
  image_url: String,
  description: String,
  book_number: u64,
  index: u64,
}

public struct CreateBookCreatorNftEvent has copy, drop {
  name: String,
  image_url: String,
  description: String,
  index: u64,
  address: address,
}

public struct CreateBookEvent has copy, drop {
  title: String,
  author: String,
  description: String,
  blob_id: String,
  creator: address,
  size: u64,
}

// 初始化合约, 创建BookServer对象
fun init (otw: WALRUS_LIBRARY, ctx: &mut TxContext) {
  // 创建BookServer对象
  let book_server = BookServer{
    id: object::new(ctx),
    total_book_size: 0,
    total_book_number: 0,
    total_member_number: 0,
  };
  transfer::share_object(book_server);

  // 创建BookCreatorNft display
  let keys = vector[
    utf8(b"name"),
    utf8(b"link"),
    utf8(b"image_url"),
    utf8(b"description"),
    utf8(b"index"),
    utf8(b"book_number"),
    utf8(b"project_url"),
    utf8(b"creator"),
  ];
  let values = vector[
    utf8(b"{name}"),
    utf8(b"https://walrus-library.walrus.site"),
    utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/ZShE1ukB6HddLeUQemkh0lSIUiCubpxp7lB1_Whvu3c"),
    utf8(b"{description}"),
    utf8(b"{index}"),
    utf8(b"{book_number}"),
    utf8(b"https://walrus-library.walrus.site"),
    utf8(b"Walrus Library")
  ];
  // 认领 publisher
  let publisher = claim(otw, ctx);

  // 获取一个新的display对象
  let mut display = new_with_fields<BookCreatorNft>(
    &publisher, keys, values, ctx
  );
  // 发布更新
  update_version(&mut display);
  transfer::public_transfer(publisher, tx_context::sender(ctx));
  transfer::public_transfer(display, tx_context::sender(ctx));
}

// mint BookCreatorNft
#[allow(lint(self_transfer))]
public fun mint_book_creator_nft(
  book_server: &mut BookServer,
  ctx: &mut TxContext,
) {
  book_server.total_member_number = book_server.total_member_number + 1;
  let book_creator_nft = BookCreatorNft{
    id: object::new(ctx),
    name: utf8(b"Walrus Library Creator NFT"),
    image_url: utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/ZShE1ukB6HddLeUQemkh0lSIUiCubpxp7lB1_Whvu3c"),
    description: utf8(b"Walrus Library Creator NFT"),
    book_number: 0,
    index: book_server.total_member_number,
  };
  transfer::public_transfer(book_creator_nft, tx_context::sender(ctx));

  event::emit(CreateBookCreatorNftEvent {
    name: utf8(b"Walrus Library Creator NFT"),
    image_url: utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/ZShE1ukB6HddLeUQemkh0lSIUiCubpxp7lB1_Whvu3c"),
    description: utf8(b"Walrus Library Creator NFT"),
    index: book_server.total_member_number,
    address: tx_context::sender(ctx),
  })
}

// 创建书籍
#[allow(lint(self_transfer))]
public fun create_book(
  book_server: &mut BookServer,
  book_creator_nft: &mut BookCreatorNft,
  cover_blob_id: String,
  title: String,
  author: String,
  description: String,
  blob_id: String,
  size: u64,
  ctx: &mut TxContext,
) {
  // 更新book_server数据
  book_server.total_book_size =  book_server.total_book_size + size;
  book_server.total_book_number =  book_server.total_book_number + 1;
  book_server.total_member_number =  book_server.total_member_number + 1;
  // 更新book_creator_nft数据
  book_creator_nft.book_number = book_creator_nft.book_number + 1;

  let book = Book{
    id: object::new(ctx),
    cover_blob_id,
    title,
    author,
    description,
    blob_id,
    creator: tx_context::sender(ctx),
    size,
  };

  transfer::transfer(book, tx_context::sender(ctx));
  event::emit(CreateBookEvent {
    title,
    author,
    description,
    blob_id,
    creator: tx_context::sender(ctx),
    size,
  })
}
