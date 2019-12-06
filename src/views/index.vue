<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">图书列表</p>
		<a href="#" slot="extra" @click.prevent="drawer = true">
			<Icon type="md-menu" size="20"/>
		</a>
		<div class="input-vo">
			<Input v-model="query" search enter-button placeholder="输入书名或作者名搜索" @on-search="search()" @on-change="search()"/>
		</div>
		<div style="padding: 10px 0;" class="table-vo">
			<Row :gutter="10">
				<Col :xs="24" :sm="12" :md="8" :lg="6" v-for="book in data">
					<a class="book-botton" @click="go(book)">
						<span class="book-name">{{book.bookName}}</span>
						<span class="book-chapters">已更新{{book.chapters}}章</span>
						<span class="book-author">{{book.author}}</span>
					</a>
				</Col>
			</Row>
			<!-- <a class="book-botton" v-for="book in data" @click="go(book)"><span class="book-name">{{book.bookName}}</span><span class="book-author">{{book.author}}</span></a> -->
			<!-- <Table border ref="selection" :columns="columns" :data="data" @on-sort-change='e=>{sortClick(e)}' @on-row-click="go"></Table> -->
		</div>
		<Drawer :closable="false" v-model="drawer">
			<Menu style="width: 100%;" @on-select="e=>{select(e)}">
				<MenuItem name="1"><Icon type="md-add-circle" />新增图书</MenuItem>
				<MenuItem name="2"><Icon type="md-albums" />站点管理</MenuItem>
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
				}else if(e=='2'){
					this.website();
				}
			},
			add() {
				this.$emit("routerpush", {
					name: "add"
				});
			},
			website() {
				this.$emit("routerpush", {
					name: "website"
				});
			}
		}
	}
</script>
<style scope>
.book-botton{
  /* border-radius: 4px; */
  border: 1px solid #515a6e;
  color: #515a6e;
  text-decoration: none;
  /* padding: 10px 10px; */
  height: 70px;
  width: 100%;
  margin-top: 10px;
  margin-right: 10px;
  float: left;
  background-color: #f3f3f3;
  }
.book-botton:hover {
  color: #fff;
  background-color: #515a6e;
}
.book-name{
	font-size: 18px;
	display:block;
  	/* border-bottom:1px solid #35495e; */
  	padding: 10px 10px;
	overflow: hidden; 
	white-space: nowrap; 
	text-overflow: ellipsis;
	font-weight:bold;
}
.book-chapters{
	font-size: 12px;
  	padding: 0 10px;
}
.book-author{
	font-size: 12px;
	display:block;
  	padding: 0 10px;
	float: right;
	overflow: hidden; 
	white-space: nowrap; 
	text-overflow: ellipsis; 
}
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
