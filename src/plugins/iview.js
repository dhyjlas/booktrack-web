import Vue from 'vue'
import {
	Button,
	Card,
	Table,
	Input,
	Row,
	Col,
	LoadingBar,
	Icon,
	Drawer,
	Page,
	Message,
	Select,
	Option,
	Form,
	FormItem,
	Spin,
	Divider,
	Menu,
	MenuItem,
	Modal,
} from 'iview'

Vue.component('Button', Button)
Vue.component('Card', Card)
Vue.component('Table', Table)
Vue.component('Input', Input)
Vue.component('Row', Row)
Vue.component('Col', Col)
Vue.component('LoadingBar', LoadingBar)
Vue.component('Icon', Icon)
Vue.component('Drawer', Drawer)
Vue.component('Page', Page)
Vue.component('Message', Message)
Vue.component('Select', Select)
Vue.component('Option', Option)
Vue.component('Form', Form)
Vue.component('FormItem', FormItem)
Vue.component('Spin', Spin)
Vue.component('Divider', Divider)
Vue.component('Menu', Menu)
Vue.component('MenuItem', MenuItem)
Vue.component('Modal', Modal)

Vue.prototype.$loading = LoadingBar;
Vue.prototype.$Message = Message;
Vue.prototype.$Modal = Modal;

import 'iview/dist/styles/iview.css'
