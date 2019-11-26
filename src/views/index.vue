<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">图书列表</p>
		<a href="#" slot="extra" @click.prevent="drawer = true">
			<Icon type="md-menu" size="20"/>
		</a>
		<div class="input-vo">
			<Input v-model="query" search enter-button placeholder="输入书名或作者名搜索" @on-search="search()" />
		</div>
		<div style="padding: 10px 0;" class="table-vo">
			<Table border ref="selection" :columns="columns" :data="data" @on-sort-change='e=>{sortClick(e)}' @on-row-click="go"></Table>
		</div>
		<Drawer :closable="false" v-model="drawer">
			<Menu style="width: 100%;" @on-select="e=>{select(e)}">
				<MenuItem name="1"><Icon type="md-add-circle" />新增图书</MenuItem>
			</Menu>
			<div class="drawer-footer">
				<span>如有疑问，可联系dhyjlas@163.com</span>
			</div>
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
				console.log(e)
				window.localStorage.setItem("reading_book_id", e.id);
				window.localStorage.setItem("reading_book_name", e.bookName);
				this.$emit("routerpush", {
					name: "book",
					params: {
						book: e
					}
				});
			},
			select(e){
				if(e=='1'){
					this.add();
				}
			},
			add() {
				this.$emit("routerpush", {
					name: "add"
				});
			}
		}
	}
</script>
<style scope>
.input-vo .ivu-input {
	border-radius: 0;
}
.input-vo .ivu-input-group-append {
	border-radius: 0;
}
.ivu-drawer-body {
	padding: 0;
}
.ivu-divider-horizontal {
	margin: 0;
}
.table-vo .ivu-btn-small{
	border-radius: 0;
}
.table-vo .ivu-table-row{
	cursor: pointer
}
.drawer-footer{
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 10px;
    text-align: left;
    background: #fff;
}
</style>
