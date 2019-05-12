<template>
  <div>
    <ul class="agrms-list w600">
      <li class="clearfix">
        <span>发布到首页:</span>
        <div>
          <el-switch v-model="newsData.is_index" active-color="#13ce66" inactive-color="#dcdfe6"></el-switch>
        </div>
      </li>
      <li class="clearfix" v-if="!newsData.is_index">
        <span>请选择营区：</span>
        <div>
          <selectSchool @changeSchool="changeSchool" :school_id="this.newsData.school_id"></selectSchool>
        </div>
      </li>
      <li class="clearfix">
        <span>新闻标题：</span>
        <div>
          <el-input v-model="newsData.title" placeholder="请输入新闻标题" clearable></el-input>
        </div>
      </li>
      <li class="clearfix">
        <span class>新闻图片：</span>
        <div>
          <el-upload
            class="upload upload1"
            action="/upload"
            :data="{type:2}"
            :show-file-list="false"
            :on-success="uploadSucess"
          >
            <img v-if="newsData.img" :src="newsData.img" class="upload-img">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
      </li>
      <li class="clearfix">
        <span>新闻内容:</span>
        <div class="quill-editor-wrap">
          <quill-editor :options="editorOption" v-model="newsData.content"></quill-editor>
        </div>
      </li>
    </ul>
    <div class="btn-wrap">
      <el-button type="primary" class="btn" @click="judgeNewsData" round>确认</el-button>
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
      //添加新闻数据
      newsData: {
        school_id: "",
        title: "",
        img: "",
        content: "",
        type: 1, //1添加 2修改 3删除
        is_index: false //是否显示在首页
      },
      editOnOff: false, //是否是修改
      editorOption: {
        modules: {
          ImageExtend: {
            loading: true,
            name: "file",
            action: "/upload",
            response: res => {
              return res.data.path;
            },
            change: (xhr, formData) => {
              formData.append("type", 2);
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
    this.$utils.store.set("defaultData", this.newsData);
    this.editOnOff = this.$route.path === "/home/news/list/edit" ? true : false;
    if (this.editOnOff) {
      const editData = this.$utils.store.get("editData");
      for (let key in this.newsData) {
        this.newsData[key] = editData[key];
      }
      this.newsData.is_index = Boolean(editData.is_index);
      this.newsData.id = editData.id;
      this.newsData.type = 2;
    }
  },
  methods: {
    //选择校区
    changeSchool(id) {
      this.newsData.school_id = id;
    },
    //图片上传成功
    uploadSucess(res) {
      if (res.code === 0) this.newsData.img = res.data.path;
    },
    //添加新闻
    judgeNewsData() {
      const utils = this.$utils;
      if (
        typeof this.newsData.school_id !== "number" &&
        !this.newsData.is_index
      ) {
        utils.showToast({ text: "请选择校区" });
      } else if (!utils.judgeNull(this.newsData.title)) {
        utils.showToast({ text: "请输入新闻标题" });
      } else if (!utils.judgeNull(this.newsData.img)) {
        utils.showToast({ text: "请上传新闻图片" });
      } else if (!utils.judgeNull(this.newsData.content)) {
        utils.showToast({ text: "请输入新闻内容" });
      } else {
        this.addNews();
      }
    },
    //发送添加新闻请求
    addNews() {
      const style = "max-width:100%;word-wrap:break-word;";
      this.$utils.setQuillStyle("p", style);
      this.$utils.setQuillStyle("img", style);
      this.newsData.content = this.$utils.query(".ql-editor")[0].innerHTML;
      this.newsData.is_index = Number(this.newsData.is_index);
      this.$axios.post("/admin/news/manage", this.newsData).then(res => {
        if (res.data.code !== 0) return;
        this.newsData = this.$utils.store.get("defaultData");
        if (this.editOnOff) this.$router.replace("/home/news/list");
      });
    }
  },
  components: {
    selectSchool: () => import("@/components/public/selectSchool.vue")
  }
};
</script>

<style scoped>
.agrms-list .search-wrap {
  margin: 0 0 15px;
}
</style>
