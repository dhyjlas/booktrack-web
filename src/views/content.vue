<template>
    <div id="target" ref="mybox">
    <Card style="width:100%;height:100%" :dis-hover="true" :bordered="false">
        <p slot="title">{{chapter.chapterName}}</p>
        <a href="#" slot="extra" @click.prevent="drawer = true">
            <Icon type="ios-construct" />
        </a>
        <div v-html="chapter.content"></div>
        <div style="margin-top:10px;text-align:center;">
            <a v-show="vlast" @click="last()">上一章</a>
            <a @click="goBook()" style="margin-left:80px;">返回目录</a>
            <a v-show="vnext" @click="next()" style="margin-left:80px;">下一章</a>
        </div>
        <Drawer :closable="false" v-model="drawer">
            <Button type="primary" @click="goIndex()" long>返回首页</Button>
            <Button type="primary" @click="refresh()" long style="margin-top:20px;" :loading="loading">刷新图书</Button>
            <Divider />
            <Button type="primary" @click="goBook()" long>返回目录</Button>
            <Button v-show="vlast" type="primary" @click="last()" long style="margin-top:20px;">上一章</Button>
            <Button v-show="vnext" type="primary" @click="next()" long style="margin-top:20px;">下一章</Button>
        </Drawer>
        <Spin size="large" fix v-if="spinShow"></Spin>
    </Card>
    </div>
</template>

<script>

export default {
    data () {
        return {
            spinShow: false,
            loading: false,
            vlast:true,
            vnext:true,
            book: [],
            chapter: [],
            drawer: false,
            loading: false,
            query: "",
            nowSerial: 0
        }
    },
    mounted(){
        this.book = {
            bookId: window.localStorage.getItem("reading_book_id"),
            bookName: window.localStorage.getItem("reading_book_name")
        }
        this.chapter = {
            chapterId: window.localStorage.getItem("reading_chapter_id"),
            chapterName: window.localStorage.getItem("reading_chapter_name"),
            content: window.localStorage.getItem("reading_chapter_content"),
            serial: parseInt(window.localStorage.getItem("reading_chapter_serial")),
            total: parseInt(window.localStorage.getItem("reading_chapter_total"))
        }
        this.setLastAndNext();
    },
    methods: {
        goIndex(){
            this.$emit("routerpush", {name: "index"});
        },
        goBook(){
            this.$emit("routerpush", {name: "book"});
        },
        refresh(){
            this.axios({
                method: 'post',
                url: '/book/refresh',
                params: {
                    id: this.book.bookId
                }
            }).then(response => {
                this.search();
            }).catch((error) => {
                console.log(error);
            })
        },
        refresh(){
            this.loading = true;
            this.axios({
                method: 'post',
                url: '/book/refresh',
                params: {
                    id: this.book.bookId
                }
            }).then(response => {
                if(response.data.status == 200){
                    this.$Message.success(response.data.msg);
                }else{
                    this.$Message.error(response.data.msg);
                }
            }).catch((error) => {
                console.log(error);
                this.$Message.error("刷新失败");
            })
        },
        setLastAndNext(){
            if(this.chapter.serial <= 1){
                this.vlast = false;
            }else{
                this.vlast = true;
            }
            if(this.chapter.serial >= this.chapter.total){
                this.vnext = false;
            }else{
                this.vnext = true;
            }
            var size = parseInt(window.localStorage.getItem("reading_book_size_" + this.book.bookId));
            window.localStorage.setItem("reading_book_page_" + this.book.bookId, parseInt((this.chapter.serial - 1) / size))
        },
        getContentByPage(e){
            this.axios({
                method: 'get',
                url: '/chapter/content',
                params: {
                    bookId: this.book.bookId,
                    serial: e - 1
                }
            }).then(response => {
                if(response.data.status == 200){
                    this.chapter.chapterId = response.data.data.id;
                    this.chapter.chapterName = response.data.data.chapterName;
                    this.chapter.content = response.data.data.content;
                    window.localStorage.setItem("reading_chapter_id", this.chapter.chapterId);
                    window.localStorage.setItem("reading_chapter_name", this.chapter.chapterName);
                    window.localStorage.setItem("reading_chapter_content", this.chapter.content);
                    window.localStorage.setItem("reading_chapter_serial", this.chapter.serial);
                    this.$refs.mybox.scrollIntoView();
                    this.chapter.serial = e;
                    this.setLastAndNext();
                }else{
                    this.$Message.error(response.data.msg);
                }
                this.spinShow = false;
            }).catch((error) => {
                this.$Message.error("获取内容失败");
                console.log(error);
                this.spinShow = false;
            })
        },
        last(){
            this.spinShow = true;
            this.getContentByPage(this.chapter.serial - 1);
        },
        next(){
            this.spinShow = true;
            this.getContentByPage(this.chapter.serial + 1);
        },
    }
}
</script>