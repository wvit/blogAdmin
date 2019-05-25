<template>
  <div>
    <ul class="agrms-list w600">
      <li class="clearfix">
        <span>博客标题：</span>
        <div>
          <el-input v-model="blogData.title" placeholder="请输入博客标题" clearable></el-input>
        </div>
      </li>
      <li class="clearfix">
        <span>博客内容:</span>
        <div class="quill-editor-wrap">
          <quill-editor :options="editorOption" v-model="blogData.content"></quill-editor>
        </div>
      </li>
    </ul>
    <div class="btn-wrap">
      <el-button type="primary" class="btn" @click="addBlog" round>确认</el-button>
    </div>
  </div>
</template>
<script>
import { Quill } from "vue-quill-editor";
import { container, ImageExtend, QuillWatch } from "quill-image-extend-module";
Quill.register("modules/ImageExtend", ImageExtend);

export default {
  data() {
    return {
      //添加博客数据
      blogData: {
        title: "",
        content: ""
      },
      //富文本配置
      editorOption: {
        modules: {
          ImageExtend: {
            loading: true,
            name: "file",
            action: "/upload",
            response: res => {
              return res.data.path;
            }
          },
          toolbar: {
            container: container,
            handlers: {
              image() {
                QuillWatch.emit(this.quill.id);
              }
            }
          }
        }
      }
    };
  },
  //初始化
  beforeMount() {
    this.$utils.store.set("defaultData", this.blogData);
    this.editOnOff = this.$route.path === "/home/blog/list/edit" ? true : false;
    if (this.editOnOff) {
      const editData = this.$utils.store.get("editData");
      for (let key in this.blogData) {
        this.blogData[key] = editData[key];
      }
      this.blogData.id = editData.id;
    }
  },
  methods: {
    //添加新闻
    addBlog() {
      const utils = this.$utils;
      if (!utils.judgeNull(this.blogData.title)) {
        utils.showToast({ text: "请输入 标题" });
      } else if (!utils.judgeNull(this.blogData.content)) {
        utils.showToast({ text: "请输入博客内容" });
      } else {
        const style = "max-width:100%;word-wrap:break-word;";
        this.$utils.setQuillStyle("p", style);
        this.$utils.setQuillStyle("img", style);
        this.blogData.content = this.$utils.query(".ql-editor")[0].innerHTML;
        this.$axios.post("/admin/addBlog", this.blogData).then(res => {
          if (res.data.code !== 0) return;
          this.blogData = this.$utils.store.get("defaultData");
          this.$utils.showToast({ text: res.data.data });
          if (this.editOnOff) this.$router.replace("/home/blog/list");
        });
      }
    }
  },
  components: {}
};
</script>

<style scoped>
.agrms-list .search-wrap {
  margin: 0 0 15px;
}
</style>
