<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">图书列表</p>
		<a href="#" slot="extra" @click.prevent="drawer = true">
			<Icon type="ios-construct" size="20"/>
		</a>
		<div>
			<Input v-model="query" search enter-button placeholder="输入书名或作者名搜索" @on-search="search()" />
		</div>
		<div style="padding: 10px 0;">
			<Table border ref="selection" :columns="columns" :data="data" @on-sort-change='e=>{sortClick(e)}'></Table>
		</div>
		<Drawer :closable="false" v-model="drawer">
			<Button type="success" long @click="add()">新增</Button>
		</Drawer>
		</Drawer>
	</Card>
</template>

<script>
	export default {
		data() {
			return {
				drawer: false,
				loading: false,
				query: "",
				columns: [{
						title: '图书名',
						key: 'bookName',
						align: 'center'
					},
					{
						title: '作者',
						key: 'author',
						align: 'center'
					},
					{
						title: '操作',
						key: 'action',
						width: 150,
						align: 'center',
						render: (h, params) => {
							return h('div', [
								h('Button', {
									props: {
										type: 'error',
										size: 'small'
									},
									on: {
										click: () => {
											this.go({
												bookId: params.row.id,
												bookName: params.row.bookName
											})
										}
									}
								}, '选择')
							]);
						}
					},
				],
				data: []
			}
		},
		mounted() {
			this.getTable({
				query: this.query,
				sort: this.key,
				direction: this.order
			});
		},
		methods: {
			getTable(e) {
				this.axios({
					method: 'get',
					url: '/book/list',
					params: {
						query: e.query,
						sort: e.sort,
						direction: e.direction
					}
				}).then(response => {
					if (response.data.status == 200) {
						this.data = response.data.data.content;
						this.total = response.data.data.totalElements;
					} else {
						this.$Message.error(response.data.msg);
					}
				}).catch((error) => {
					console.log(error);
					this.$Message.error("获取失败");
				})
			},
			search() {
				this.getTable({
					query: this.query,
					sort: this.key,
					direction: this.order
				});
			},
			go(e) {
				window.localStorage.setItem("reading_book_id", e.bookId);
				window.localStorage.setItem("reading_book_name", e.bookName);
				this.$emit("routerpush", {
					name: "book",
					params: {
						book: e
					}
				});
			},
			add() {
				this.$emit("routerpush", {
					name: "add"
				});
			}
		}
	}
</script>
