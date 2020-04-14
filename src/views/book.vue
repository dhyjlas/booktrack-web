<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false" class="book-vo">
		<p slot="title"><Icon type="ios-undo" size="24" style="margin-right:8px;cursor:pointer;" @click="goIndex"/>{{book.bookName}}
		<Icon type="md-sync" size="20" style="margin-left:4px;cursor:pointer;" @click="refresh"/></p>
		<a href="#" slot="extra" @click.prevent="drawer = true">
			<Icon type="md-menu" size="20"/>
		</a>
		<div style="padding: 0 0 10px 0;">
			<Table :show-header="false" ref="selection" :columns="columns" :data="data" @on-sort-change='e=>{sortClick(e)}' @on-row-click="go" class="book-table-vo"></Table>
		</div>
		<div style="text-align: center;">
			<Page :current="page+1" :total="total" :page-size="size" :page-size-opts="sizeOpts" show-elevator
			 show-total @on-change="e=>{pageSearch(e)}" @on-page-size-change="e=>(sizeSearch(e))" />
		</div>
		<Drawer :closable="false" v-model="drawer" @on-visible-change="openDrawer">
			<Menu style="width: 100%;" @on-select="e=>{select(e)}" v-if="isMenu">
				<MenuItem name="1"><Icon type="md-home" />返回首页</MenuItem>
				<MenuItem name="2"><Icon type="md-sync" />刷新图书</MenuItem>
				<MenuItem name="3"><Icon type="md-book" />图书信息</MenuItem>
				<MenuItem name="4"><Icon type="md-close" />删除图书</MenuItem>
				<MenuItem name="5"><Icon type="md-close" />清空内容</MenuItem>
			</Menu>
			<Form ref="bookInfo" :model="bookInfo" :label-width="0" v-if="!isMenu" class="book-drawer-vo">
				<FormItem prop="">
				</FormItem>
				<FormItem prop="bookName">
					<Input v-model="bookInfo.bookName"><span slot="prepend">书名</span></Input>
				</FormItem>
				<FormItem prop="author">
					<Input v-model="bookInfo.author"><span slot="prepend">作者</span></Input>
				</FormItem>
				<FormItem prop="url">
					<Input v-model="bookInfo.url"><span slot="prepend">网址</span></Input>
				</FormItem>
				<FormItem prop="url">
					<Select v-model="bookInfo.source">
						<Option v-for="item in sourceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
					</Select>
				</FormItem>
				<Button type="primary" @click="handleSubmit" :loading="loading" long v-if="isAdmin()">保存</Button>
				<Button style="margin-top: 10px" @click="closeBookInfo" long>返回</Button>
			</Form>
		</Drawer>
		<Spin size="large" fix v-if="spinShow"></Spin>
	</Card>
</template>

<script>
	export default {
		data() {
			return {
				isMenu: true,
				spinShow: false,
				book: [],
				drawer: false,
				loading: false,
				total: 0,
				size: 0,
				page: 0,
				sizeOpts: [10, 20, 30, 50],
				query: "",
				sourceList: [],
				bookInfo: {},
                role: window.localStorage.getItem("website_role") ? window.localStorage.getItem("website_role") : "user",
				columns: [{
					title: '章节目录',
					align: 'center',
					// key: 'chapterName',
					render: (h, params) => {
						if(params.row.id == window.localStorage.getItem("reading_" + this.book.bookId + "_chapter_id")){
							return h('div', {style:{color: "#2d8cf0"}}, params.row.chapterName)
						}else{
							return h('div', {}, params.row.chapterName)
						}
						// return h('div', [
						// 	h('a', {
						// 		props: {
						// 			type: 'error',
						// 			size: 'small'
						// 		},
						// 		on: {
						// 			click: () => {
						// 				this.go(params.row)
						// 			}
						// 		}
						// 	}, params.row.chapterName)
						// ]);
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

			this.axios({
				method: 'get',
				url: '/book/website',
			}).then(response => {
				if (response.data.status == 200) {
					response.data.data.forEach((item, index) => {
						this.sourceList.push(item);
					})
				}
			})
		},
		methods: {
			isAdmin(){
				return this.role.split('_')[0] == 'admin'
			},
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
						window.localStorage.setItem("reading_" + this.book.bookId + "_chapter_id", response.data.data.id);
						window.localStorage.setItem("reading_" + this.book.bookId + "_chapter_name", response.data.data.chapterName);
						window.localStorage.setItem("reading_" + this.book.bookId + "_chapter_content", response.data.data.content);
						window.localStorage.setItem("reading_" + this.book.bookId + "_chapter_total", this.total);
						window.localStorage.setItem("reading_" + this.book.bookId + "_chapter_serial", e.serial);
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
				}else if(e == '3'){
					this.openBookInfo();
				}else if(e == '4'){
					this.deleteBook();
				}else if(e == '5'){
					this.deleteChapter();
				}
			},
			openBookInfo(){
				this.isMenu = false;
				this.axios({
					method: 'get',
					url: '/book/info/' + this.book.bookId
				}).then(response => {
					if (response.data.status == 200) {
						this.bookInfo = response.data.data;
					}
					}).catch(error => {
						console.log(error);
						this.$Message.error("提交失败");
					})
			},
			closeBookInfo(){
				this.isMenu = true;
			},
			openDrawer(e){
				if(e){
					this.isMenu = true;
				}
			},
			goIndex() {
				this.$emit("routerpush", {
					name: "index"
				});
			},
			handleSubmit(){
				this.loading = true;
				this.axios({
					method: 'post',
					url: '/book/save',
					data: this.bookInfo,
					headers:{
						Authorization: this.role
					}
				}).then(response => {
					if (response.data.status == 200) {
						this.$Message.success(response.data.msg);
						this.drawer = false;
					} else {
						this.$Message.error(response.data.msg);
					}
					this.loading = false;
				}).catch(error => {
					this.loading = false;
					console.log(error);
					this.$Message.error("提交失败");
				})
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
			},
			deleteBook(){
				this.$Modal.confirm({
                    title: '提醒',
                    content: '<p>是否确认删除整本图书？</p>',
                    onOk: () => {
						const msg = this.$Message.loading({
							content: '删除中...',
							duration: 0
						});
						this.axios({
							method: 'delete',
							url: '/book/all/' + this.book.bookId,
							headers:{
								Authorization: this.role
							}
						}).then(response => {
							if (response.data.status == 200) {
								this.$Message.success(response.data.msg);
								this.$emit("routerpush", {
									name: "index"
								});
							} else {
								this.$Message.error(response.data.msg);
							}
							setTimeout(msg, 1);
						}).catch(error => {
							console.log(error);
							this.$Message.error("提交失败");
							setTimeout(msg, 1);
						})
                    },
                    onCancel: () => {
                    }
				});
			},
			deleteChapter(){
				this.$Modal.confirm({
                    title: '提醒',
                    content: '<p>是否确认清空所有章节内容？</p>',
                    onOk: () => {
						const msg = this.$Message.loading({
							content: '清空中...',
							duration: 0
						});
						this.axios({
							method: 'delete',
							url: '/chapter/all/' + this.book.bookId,
							headers:{
								Authorization: this.role
							}
						}).then(response => {
							if (response.data.status == 200) {
								this.$Message.success(response.data.msg);
								this.search();
							} else {
								this.$Message.error(response.data.msg);
							}
							setTimeout(msg, 1);
						}).catch(error => {
							console.log(error);
							this.$Message.error("提交失败");
							setTimeout(msg, 1);
						})
                    },
                    onCancel: () => {
                    }
				});
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
.book-table-vo .ivu-table-row{
	cursor: pointer
}
.book-drawer-vo .ivu-input {
	border-radius: 0;
}
.book-drawer-vo .ivu-input-group-prepend{
	border-radius: 0;
}
.book-drawer-vo .ivu-btn {
	border-radius: 0;
}
.ivu-select-selection {
	border-radius: 0;
}
</style>
<style>
.book-vo .ivu-card-body{
	padding: 0;
}
.book-vo .ivu-table-wrapper {
	border: 0 solid #dcdee2;
}
</style>

