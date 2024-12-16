module contract::walrus_library;
use std::string::{String, utf8};
use sui::event::{Self};
use sui::package::{claim};
use sui::display::{new_with_fields, update_version};
use sui::balance::{Self,Balance};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::clock::{timestamp_ms, Clock};
use sui::table::{Self, Table};

public struct WALRUS_LIBRARY has drop {}

public struct BookServer has key, store {
  id: UID,
  total_book_size: u64,
  total_book_number: u64,
  total_member_number: u64,
  pool: Balance<SUI>,
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
  content_type: String,
  book_review: Table<address, BookReview>,
}

public struct BookReview has key, store {
  id: UID,
  book_id: ID,
  author: address,
  content_blob_id: String,
  timestamp: u64,
}

public struct BookCreatorNft has key {
  id: UID,
  name: String,
  image_url: String,
  description: String,
  book_number: u64,
  index: u64,
  donate_amount: u64,
}

// mint creator nft event
public struct CreateBookCreatorNftEvent has copy, drop {
  name: String,
  image_url: String,
  description: String,
  index: u64,
  address: address,
}

// create book event
public struct CreateBookEvent has copy, drop {
  book_id: ID,
  title: String,
  author: String,
  description: String,
  blob_id: String,
  creator: address,
  size: u64,
  content_type: String,
}

// 创建书评事件
public struct CreateBookReviewEvent has copy,drop {
  book_id: ID,
  author: address,
  content_blob_id: String,
  timestamp: u64,
}

// donate server event
public struct DonateServerEvent has copy, drop {
  amount: u64,
  address: address,
  timestamp: u64,
}

// 初始化合约, 创建BookServer对象
fun init (otw: WALRUS_LIBRARY, ctx: &mut TxContext) {
  // 创建BookServer对象
  let book_server = BookServer{
    id: object::new(ctx),
    total_book_size: 0,
    total_book_number: 0,
    total_member_number: 0,
    pool: balance::zero(),
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
    utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/7lJpg5iPzXAcG759P1d30mCNfRXjt_mYeWR228GLjyw"),
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

// 创建 BookCreatorNft 对象
fun get_book_creator_nft(
  book_server: &mut BookServer,
  ctx: &mut TxContext,
): BookCreatorNft {
  book_server.total_member_number = book_server.total_member_number + 1;
  let book_creator_nft = BookCreatorNft{
    id: object::new(ctx),
    name: utf8(b"Walrus Library Creator NFT"),
    image_url: utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/7lJpg5iPzXAcG759P1d30mCNfRXjt_mYeWR228GLjyw"),
    description: utf8(b"Walrus Library Creator NFT"),
    book_number: 0,
    index: book_server.total_member_number,
    donate_amount: 0,
  };
  book_creator_nft
}

// 铸造creator nft
public fun mint_book_creator_nft(
  book_server: &mut BookServer,
  ctx: &mut TxContext,
) {
  let nft = get_book_creator_nft(book_server, ctx);
  send_book_creator_nft(book_server, nft, ctx);
}

// 发送creator nft
fun send_book_creator_nft(
  book_server: &BookServer,
  book_creator_nft: BookCreatorNft,
  ctx: &TxContext,
) {
  transfer::transfer(book_creator_nft, tx_context::sender(ctx));

  event::emit(CreateBookCreatorNftEvent {
    name: utf8(b"Walrus Library Creator NFT"),
    image_url: utf8(b"https://aggregator.walrus-testnet.walrus.space/v1/7lJpg5iPzXAcG759P1d30mCNfRXjt_mYeWR228GLjyw"),
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
  content_type: String,
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
    content_type,
    book_review: table::new(ctx),
  };

  event::emit(CreateBookEvent {
    book_id: object::uid_to_inner(&book.id),
    title,
    author,
    description,
    blob_id,
    creator: tx_context::sender(ctx),
    size,
    content_type,
  });
  transfer::transfer(book, tx_context::sender(ctx));
}

// 创建书评
public fun create_book_review(
  book: &mut Book,
  author: address,
  content_blob_id: String,
  clock: &Clock,
  ctx: &mut TxContext
) {
  let timestamp = timestamp_ms(clock);
  let id = object::new(ctx);
  let book_id = object::uid_to_inner(&book.id);
  let book_review = BookReview {
    id,
    book_id,
    author,
    content_blob_id,
    timestamp,
  };
  event::emit(CreateBookReviewEvent {
    book_id,
    author,
    content_blob_id,
    timestamp,
  });
  // 添加到book对象里
  table::add(&mut book.book_review, tx_context::sender(ctx), book_review);
}

// 没有创作者nft的捐赠
public fun donate_server(
  book_server: &mut BookServer,
  donate_coin: Coin<SUI>,
  clock: &Clock,
  ctx: &mut TxContext,
) {
  let donate_value = coin::value(&donate_coin);
  let donate_balance = coin::into_balance(donate_coin);
  balance::join(&mut book_server.pool, donate_balance);
  let mut book_creator_nft = get_book_creator_nft(book_server, ctx);
  book_creator_nft.donate_amount = donate_value;
  send_book_creator_nft(book_server, book_creator_nft, ctx);
  event::emit(DonateServerEvent {
    amount: donate_value,
    address: tx_context::sender(ctx),
    timestamp: timestamp_ms(clock),
  })
}

// 有创作者nft的捐赠
public fun donate_server_with_creator_nft(
  book_server: &mut BookServer,
  book_creator_nft: &mut BookCreatorNft,
  donate_coin: Coin<SUI>,
  clock: &Clock,
  ctx: &mut TxContext,
) {
  let donate_value = coin::value(&donate_coin);
  let donate_balance = coin::into_balance(donate_coin);
  balance::join(&mut book_server.pool, donate_balance);
  book_creator_nft.donate_amount = book_creator_nft.donate_amount + donate_value;
  event::emit(DonateServerEvent {
    amount: donate_value,
    address: tx_context::sender(ctx),
    timestamp: timestamp_ms(clock),
  })
}