<template>
	<Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
		<p slot="title">图书新增</p>
		<Form ref="book" :model="book" :rules="ruleValidate" :label-width="80">
			<FormItem label="图书网址" prop="url">
				<Input v-model="book.url" placeholder="请输入图书网址"></Input>
			</FormItem>
			<FormItem label="来源网站" prop="source">
				<Select v-model="book.source">
					<Option v-for="item in sourceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
				</Select>
			</FormItem>
			<Button style="margin-top: 50px" type="primary" @click="handleSubmit('book')" :loading="loading3" long>提交</Button>
			<Button @click="go()" style="margin-top: 8px" long>返回</Button>
		</Form>
	</Card>
</template>
<script>
	export default {
		data() {
			return {
				loading3: false,
				book: {
					url: '',
					source: '0'
				},
				sourceList: [{
					value: "0",
					label: "自动识别"
				}],
				ruleValidate: {
					url: [{
						required: true,
						message: '图书网址不能为空',
						trigger: 'blur'
					}, ],
					source: [{
						required: true,
						message: '来源网站不能为空',
						trigger: 'blur'
					}, ]
				}
			}
		},
		mounted() {
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
			handleSubmit(book) {
				this.$refs[book].validate((valid) => {
					if (valid) {
						this.loading3 = true;
						this.axios({
							method: 'post',
							url: '/book/add',
							data: this.book
						}).then(response => {
							if (response.data.status == 200) {
								this.$Message.success(response.data.msg);
								this.$emit("routerpush", {
									name: "index"
								});
							} else {
								this.$Message.error(response.data.msg);
							}
							this.loading3 = false;
						}).catch(error => {
							this.loading3 = false;
							console.log(error);
							this.$Message.error("新增失败");
						})
					}
				})
			},
			handleReset(name) {
				this.$refs[name].resetFields();
			},
			go() {
				this.$emit("routerpush", {
					name: "index"
				});
			}
		}
	}
</script>
