<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">{{book.bookName}}</p>
		<a href="#" slot="extra" @click.prevent="drawer = true">
			<Icon type="md-menu" size="20"/>
		</a>
		<div style="padding: 10px 0;">
			<Table border ref="selection" :columns="columns" :data="data" @on-sort-change='e=>{sortClick(e)}'></Table>
		</div>
		<div style="text-align: right;">
			<Page :current="page+1" :total="total" :page-size="size" :page-size-opts="sizeOpts" show-elevator show-sizer
			 show-total @on-change="e=>{pageSearch(e)}" @on-page-size-change="e=>(sizeSearch(e))" />
		</div>
		<Drawer :closable="false" v-model="drawer">
			<Menu style="width: 100%;" @on-select="e=>{select(e)}">
				<MenuItem name="1"><Icon type="md-home" />返回首页</MenuItem>
				<MenuItem name="2"><Icon type="md-sync" />刷新图书</MenuItem>
			</Menu>
		</Drawer>
		<Spin size="large" fix v-if="spinShow"></Spin>
	</Card>
</template>

<script>
	export default {
		data() {
			return {
				spinShow: false,
				book: [],
				drawer: false,
				loading: false,
				total: 0,
				size: 0,
				page: 0,
				sizeOpts: [10, 20, 30, 50],
				query: "",
				columns: [{
					title: '章节目录',
					align: 'center',
					render: (h, params) => {
						return h('div', [
							h('a', {
								props: {
									type: 'error',
									size: 'small'
								},
								on: {
									click: () => {
										this.go(params.row)
									}
								}
							}, params.row.chapterName)
						]);
					}
				}, ],
				data: []
			}
		},
		mounted() {
			this.book = {
				bookId: window.localStorage.getItem("reading_book_id"),
				bookName: window.localStorage.getItem("reading_book_name")
			}
			if (window.localStorage.getItem("reading_book_size_" + this.book.bookId) != null) {
				this.size = parseInt(window.localStorage.getItem("reading_book_size_" + this.book.bookId));
			} else {
				window.localStorage.setItem("reading_book_size_" + this.book.bookId, 10);
				this.size = 10;
			}
			if (window.localStorage.getItem("reading_book_page_" + this.book.bookId) != null) {
				this.page = parseInt(window.localStorage.getItem("reading_book_page_" + this.book.bookId));
			} else {
				window.localStorage.setItem("reading_book_page_" + this.book.bookId, 0);
				this.page = 0;
			}
			this.search();
		},
		methods: {
			getTable(e) {
				this.axios({
					method: 'get',
					url: '/chapter/list',
					params: {
						sort: e.sort,
						size: e.size,
						page: e.page,
						direction: e.direction,
						bookId: e.bookId
					}
				}).then(response => {
					if (response.data.status == 200) {
						this.data = response.data.data.content;
						this.total = response.data.data.totalElements;
					} else {
						this.$Message.error(response.data.msg)
					}
				}).catch((error) => {
					this.$Message.error("获取失败")
					console.log(error);
				})
			},
			//切页按钮
			pageSearch(e) {
				console.log(e);
				this.page = e - 1;
				window.localStorage.setItem("reading_book_page_" + this.book.bookId, this.page);
				this.search();
			},
			//显示数目切换按钮
			sizeSearch(e) {
				this.size = e;
				window.localStorage.setItem("reading_book_size_" + this.book.bookId, this.size);
				this.search();
			},
			//排序按钮
			sortClick(e) {
				this.key = e.key;
				this.order = e.order;
				this.search();
			},
			search() {
				this.getTable({
					size: this.size,
					page: this.page,
					query: this.query,
					sort: this.key,
					direction: this.order,
					bookId: this.book.bookId
				});
			},
			go(e) {
				this.spinShow = true;
				this.axios({
					method: 'get',
					url: '/chapter/content/' + e.id,
				}).then(response => {
					if (response.data.status == 200) {
						window.localStorage.setItem("reading_chapter_id", response.data.data.id);
						window.localStorage.setItem("reading_chapter_name", response.data.data.chapterName);
						window.localStorage.setItem("reading_chapter_content", response.data.data.content);
						window.localStorage.setItem("reading_chapter_total", this.total);
						window.localStorage.setItem("reading_chapter_serial", e.serial);
						this.spinShow = false;
						this.$emit("routerpush", {
							name: "content"
						});
					} else {
						this.spinShow = false;
						this.$Message.error(response.data.msg);
					}
				}).catch((error) => {
					console.log(error);
					this.spinShow = false;
					this.$Message.error("获取内容失败");
				})

			},
			select(e){
				if(e == '1'){
					this.goIndex();
				}else if(e == '2'){
					this.refresh();
				}
			},
			goIndex() {
				this.$emit("routerpush", {
					name: "index"
				});
			},
			refresh() {
                const msg = this.$Message.loading({
                    content: '刷新中...',
                    duration: 0
                });
				this.axios({
					method: 'post',
					url: '/book/refresh',
					params: {
						id: this.book.bookId
					}
				}).then(response => {
					if (response.data.status == 200) {
						this.$Message.success(response.data.msg);
						this.search();
					} else {
						this.$Message.error(response.data.msg);
					}
					setTimeout(msg, 1);
				}).catch((error) => {
					console.log(error);
					this.$Message.error("刷新失败");
					setTimeout(msg, 1);
				})
			}
		}
	}
</script>
<style scope>
.ivu-drawer-body {
	padding: 0;
}
.ivu-divider-horizontal {
	margin: 0;
}
</style>

