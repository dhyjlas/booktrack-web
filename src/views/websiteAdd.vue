<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">{{pageName}}</p>
		<Form ref="dataInfo" :model="dataInfo" :rules="ruleValidate" :label-width="80" class="web-form-ov">
			<FormItem label="站点名称" prop="name">
				<Input v-model="dataInfo.name" placeholder="请输入站点名称"></Input>
			</FormItem>
			<FormItem label="站点地址" prop="host">
				<Input v-model="dataInfo.host" placeholder="请输入站点地址"></Input>
			</FormItem>
            <Divider><span style="font-size:14px">爬取规则</span></Divider>
			<FormItem label="书名规则" prop="bookNameXpath">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.bookNameXpath" placeholder="请输入书名规则，采用XPath表达式"></Input>
			</FormItem>
			<FormItem label="作者规则" prop="authorXpath">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.authorXpath" placeholder="请输入作者规则，采用XPath表达式"></Input>
			</FormItem>
			<FormItem label="章节名称规则" prop="chapterNameXpath">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.chapterNameXpath" placeholder="请输入章节名称规则，采用XPath表达式"></Input>
			</FormItem>
			<FormItem label="章节地址规则" prop="chapterUrlXpath">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.chapterUrlXpath" placeholder="请输入章节地址规则，采用XPath表达式"></Input>
			</FormItem>
			<FormItem label="章节正文规则" prop="chapterContentXpath">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.chapterContentXpath" placeholder="请输入章节正文规则，采用XPath表达式"></Input>
			</FormItem>
			<FormItem label="请求头参数" prop="header">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.header" placeholder="请输入请求头参数，采用JSON格式"></Input>
			</FormItem>
			<FormItem label="正文内容替换" prop="contentReplace">
				<Input type="textarea" :autosize="{minRows: 2}" v-model="dataInfo.contentReplace" placeholder="请输入正文内容替换，采用JSON格式"></Input>
			</FormItem>
			<FormItem label="最长请求时间" prop="maxOutTime">
				<Input v-model="dataInfo.maxOutTime" placeholder="请输入最长请求时间"></Input>
			</FormItem>
			<Button style="margin-top: 10px" type="primary" @click="handleSubmit('dataInfo')" :loading="loading" long v-if="isAdmin()">保存</Button>
			<Button style="margin-top: 10px" type="error" @click="handleDelete()" :loading="loading2" long v-if="isAdmin() && dataInfo.id > 0">删除</Button>
            <span v-if="!isAdmin()" style="color:#F00;">抱歉，您没有管理权限，无法添加或修改站点信息，您可将需要添加的站点数据发送至邮箱：dhyjlas@163.com</span>
			<Button style="margin-top: 10px" type="success" @click="openModal()" :loading="loading" long>爬取规则测试</Button>
			<Button @click="go()" style="margin-top: 8px" long>返回</Button>
		</Form>

        <!-- 测试页 -->
        <Modal v-model="modal" title="测试" footer-hide fullscreen class="website-modal-vo">
            <Form ref="testInfo" :model="testInfo" :label-width="80" class="web-form-ov">
			<FormItem label="目录页地址" prop="catalogAddress">
				<Input v-model="testInfo.catalogAddress" placeholder="请输入目录页地址"></Input>
			</FormItem>
			<FormItem label="正文页地址" prop="contentAddress">
				<Input v-model="testInfo.contentAddress" placeholder="请输入正文页地址"></Input>
			</FormItem>
			<Button type="primary" @click="handleTest('testInfo')" :loading="loading3" long>点击测试</Button>
            <Divider><span style="font-size:14px">测试结果</span></Divider>
			<FormItem label="书名" prop="bookName">
				<Input type="textarea" :autosize="{minRows: 2, maxRows: 5}" v-model="testInfo.bookName" readonly></Input>
			</FormItem>
			<FormItem label="作者" prop="author">
				<Input type="textarea" :autosize="{minRows: 2, maxRows: 5}" v-model="testInfo.author" readonly></Input>
			</FormItem>
			<FormItem label="章节名称" prop="chapterName">
				<Input type="textarea" :autosize="{minRows: 2, maxRows: 5}" v-model="testInfo.chapterName" readonly></Input>
			</FormItem>
			<FormItem label="章节地址" prop="chapterUrl">
				<Input type="textarea" :autosize="{minRows: 2, maxRows: 5}" v-model="testInfo.chapterUrl" readonly></Input>
			</FormItem>
            <Divider><span style="font-size:14px">章节正文HTML</span></Divider>
			<Input type="textarea" :autosize="{minRows: 2, maxRows: 8}" v-model="testInfo.chapterContent" readonly></Input>
            <Divider v-if="testInfo.chapterContent"><span style="font-size:14px">展示正文</span></Divider>
			<Card class="website-card-vo" dis-hover v-if="testInfo.chapterContent">
				<Input type="textarea" v-html="testInfo.chapterContent"></Input>
			</Card>
		</Form>
        </Modal>
	</Card>
</template>
<script>
	export default {
		data() {
			return {
				loading: false,
				loading2: false,
				loading3: false,
				sourceList: [{
					value: 0,
					label: "自动识别"
				}],
				ruleValidate: {
					name: [{required: true, message: '不能为空', trigger: 'blur'}],
					host: [{required: true, message: '不能为空', trigger: 'blur'}],
					bookNameXpath: [{required: true, message: '不能为空', trigger: 'blur'}],
					chapterNameXpath: [{required: true, message: '不能为空', trigger: 'blur'}],
					chapterUrlXpath: [{required: true, message: '不能为空', trigger: 'blur'}],
					chapterContentXpath: [{required: true, message: '不能为空', trigger: 'blur'}]
                },
                role: window.localStorage.getItem("website_role") ? window.localStorage.getItem("website_role") : "user",
                dataInfo: {
                    id: window.localStorage.getItem("website_query_id") ? window.localStorage.getItem("website_query_id") : 0,
                    name: "",
                    host: "",
                    maxOutTime: 10000,
                    bookNameXpath: "",
                    authorXpath: "",
                    chapterUrlXpath: "",
                    chapterNameXpath: "",
                    chapterContentXpath: "",
                    header: "",
                    contentReplace: ""
                },
                pageName: "",
                modal: false,
                testInfo: {
                    catalogAddress: "",
                    contentAddress: "",
                    bookName: "",
                    author: "",
                    chapterName: "",
                    chapterUrl: "",
                    chapterContent: "",
                }
			}
		},
		mounted() {
            if(this.dataInfo.id > 0){
                this.axios({
                    method: 'get',
                    url: '/website/'+this.dataInfo.id,
                }).then(response => {
                    if (response.data.status == 200) {
                        this.dataInfo = response.data.data
                        this.pageName = this.dataInfo.name
                    }
                })
            }else{
                this.pageName = "新增站点"
            }
		},
		methods: {
			isAdmin(){
				return this.role.split('_')[0] == 'admin'
			},
			handleSubmit(dataInfo) {
				this.$refs[dataInfo].validate((valid) => {
					if (valid) {
						this.loading = true;
						this.axios({
							method: 'post',
							url: '/website/save',
							data: this.dataInfo,
							headers:{
								Authorization: this.role
							}
						}).then(response => {
							if (response.data.status == 200) {
								this.$Message.success(response.data.msg);
								this.$emit("routerpush", {
									name: "website"
								});
							} else {
								this.$Message.error(response.data.msg);
							}
							this.loading = false;
						}).catch(error => {
							this.loading = false;
							console.log(error);
							this.$Message.error("提交失败");
						})
					}
				})
			},
			handleDelete() {
				this.$Modal.confirm({
                    title: '提醒',
                    content: '<p>是否确认删除？</p>',
                    onOk: () => {
                        this.loading2 = true;
						this.axios({
							method: 'delete',
							url: '/website/' + this.dataInfo.id,
							headers:{
								Authorization: this.role
							}
						}).then(response => {
							if (response.data.status == 200) {
								this.$Message.success(response.data.msg);
								this.$emit("routerpush", {
									name: "website"
								});
							} else {
								this.$Message.error(response.data.msg);
							}
							this.loading2 = false;
						}).catch(error => {
							this.loading2 = false;
							console.log(error);
							this.$Message.error("提交失败");
						})
                    },
                    onCancel: () => {
                    }
				});
				
				
			},
			handleReset(name) {
				this.$refs[name].resetFields();
			},
			go() {
				this.$emit("routerpush", {
					name: "website"
				});
            },
            openModal(){
                this.modal = true
            },
			handleTest() {
                this.dataInfo.catalogAddress = this.testInfo.catalogAddress
                this.dataInfo.contentAddress = this.testInfo.contentAddress
				this.loading3 = true;
				this.axios({
					method: 'post',
					url: '/website/test',
					data: this.dataInfo
				}).then(response => {
					if (response.data.status == 200) {
                        this.$Message.success(response.data.msg);
                        this.testInfo.bookName = response.data.data.bookName
                        this.testInfo.author = response.data.data.author
                        this.testInfo.chapterName = response.data.data.chapterName
                        this.testInfo.chapterUrl = response.data.data.chapterUrl
                        this.testInfo.chapterContent = response.data.data.chapterContent
					} else {
						this.$Message.error(response.data.msg);
					}
					this.loading3 = false;
				}).catch(error => {
					this.loading3 = false;
					console.log(error);
					this.$Message.error("提交失败");
				})
			},
		}
	}
</script>
<style scope>
.web-form-ov .ivu-input {
	border-radius: 0;
}
.web-form-ov .ivu-select-selection{
	border-radius: 0;
}
.web-form-ov .ivu-select-dropdown{
	border-radius: 0;
}
.web-form-ov .ivu-btn{
	border-radius: 0;
}
.web-form-ov textarea.ivu-input {
    font-size: 12px;
}
.website-card-vo {
	border-radius: 0;
}
@media (max-width: 768px){
	.website-modal-vo .ivu-modal {
		width: 100% !important;
		margin: 0 !important;
	}
}
</style>
