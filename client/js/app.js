const { Router, Route, IndexRoute, Link, browserHistory } = ReactRouter;
const user = {  name: 'foo',  pass: 'bar' };
const AUTH = "Basic " + btoa(user.name + ":" + user.pass);
const API_ROOT = 'http://localhost:8080/';
const DEFAULT_VALUE = {
    name: "",
    title: "",
    email: [""],
    phone: [""],
    address: [""],
    company: ""
}

const serialize = (obj) => {
  let str = [];
  for(let p in obj)
    if (obj.hasOwnProperty(p)) {
      let val = (typeof(obj[p]) == 'object')? JSON.stringify(obj[p]):obj[p];
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
    }
  return str.join("&");
};

class MainLayout extends React.Component {
  render() {
    return(
      <div>
        <Menu/>
        <section className="main-content">
          {this.props.children}
        </section>
      </div>
    );
  }
}

class Menu extends React.Component {
  render() {
    return(
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    );
  }
}

class Home extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      data: [],
      static_data: []
    };
    this.getData    = this.getData.bind(this);
    this.appendData = this.appendData.bind(this);
    this.sliceData  = this.sliceData.bind(this);
    this.filterData = this.filterData.bind(this);
  }
  componentWillMount() {
    this.getData();
  }
  getData() {
    fetch(API_ROOT + 'api/contacts', {
      method: 'GET',
      headers: {
        "Authorization": AUTH
      }
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      this.setState({
        data: data.data,
        static_data: data.data
      });
    })
  }
  appendData(data) {
    let old_data = this.state.data;
    let new_data = old_data.concat(data);
    this.setState({
      data: new_data,
      static_data: new_data
    });
  }
  sliceData(nick) {
    let old_data = this.state.data;
    let new_data = old_data.filter((v) => { return v.nick_name != nick; });
    this.setState({
      data: new_data,
      static_data: new_data
    });
  }
  filterData(keyword) {
    let data = this.state.static_data;
    let filtered = [];
    if (!keyword){
      this.setState({data: data});
      return;
    }
    for (let i = 0; i < data.length; i++) {
      let regex = new RegExp(keyword, "i");
      if (regex.test(data[i].name) || regex.test(data[i].company)) {
        filtered.push(data[i]);
      } else {
        for (let j = 0; j < data[i].email.length; j++) {
          if (regex.test(data[i].email[j])) {
            filtered.push(data[i]);
            break;
          }
        }
        for (let k = 0; k < data[i].phone.length; k++) {
          if (regex.test(data[i].phone[k])) {
            filtered.push(data[i]);
            break;
          }
        }
        for (let l = 0; l < data[i].address.length; l++) {
          if (regex.test(data[i].address[l])) {
            filtered.push(data[i]);
            break;
          }
        }
      }
    }
    this.setState({data: filtered});
  }
  render() {
    return(
      <div className="container">
        <ContactContainer data={this.state.data} update={this.appendData} delete={this.sliceData} find={this.filterData} />
      </div>
    );
  }
}

class About extends React.Component {
  render() {
    return(
      <div className="container">
        <h1>About</h1>
      </div>
    );
  }
}

class ContactContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: DEFAULT_VALUE,
      add: false,
      detail: false,
      edit: false
    }
    this.updateData = this.updateData.bind(this);
    this.addData    = this.addData.bind(this);
    this.viewDetail = this.viewDetail.bind(this);
    this.editData   = this.editData.bind(this);
    this.saveData   = this.saveData.bind(this);
    this.removeData = this.removeData.bind(this);
    this.searchData = this.searchData.bind(this);
  }
  viewDetail(nick) {
    fetch(API_ROOT + 'api/contacts/' + nick, {
      method: 'GET',
      headers: {
        "Authorization": AUTH
      }
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      this.setState({
        data: data.data,
        detail: true,
        edit: false,
        add: false,
      });
    });
  }
  updateData(data) {
    this.props.update(data);
    this.viewDetail(data.nick_name);
    this.setState({
      add: false,
      detail: true,
      edit: false
    });
  }
  removeData(nick) {
    this.props.delete(nick);
    this.setState({
      add: false,
      detail: false,
      edit: false
    });
  }
  addData() {
    this.setState({
      add: true,
      detail: false,
      edit: false
    });
  }
  editData() {
    this.setState({
      add: false,
      detail: false,
      edit: true
    });
  }
  saveData(nick){;
    this.viewDetail(nick);
    this.setState({
      add: false,
      detail: true,
      edit: false
    });
  }
  searchData(keyword) {
    this.props.find(keyword);
    this.setState({
      add: false,
      detail: false,
      edit: false
    });
  }
  render() {
    let data_contact = this.props.data.map((contact, i) => {
      return(
        <Contact key={i} name={contact.name} company={contact.company} nick={contact.nick_name}
         view={this.viewDetail} />
      );
    });
    return(
      <div className="contact-container">
        <div className="contact-item-container">
          <button onClick={this.addData}>ADD</button>
          <Search filter={this.searchData} />
          {data_contact}
        </div>
        {(this.state.add)? <Add save={this.updateData} />:null}
        {(this.state.detail)? <Detail data={this.state.data} edit={this.editData} delete={this.removeData} />:null}
        {(this.state.edit)? <Edit data={this.state.data} save={this.saveData} />:null}
      </div>
    );
  }
}

class Contact extends React.Component {
  constructor (props) {
    super(props);
    this.pickContact = this.pickContact.bind(this);
  }
  pickContact() {
    this.props.view(this.props.nick);
  }
  render() {
    return(
      <div onClick={this.pickContact} className="contact-item">
        <p className="contact-name">{this.props.name}</p>
        <i>{this.props.company}</i>
      </div>
    );
  }
}

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.changeAction = this.changeAction.bind(this);
    this.removeContact = this.removeContact.bind(this);
  }
  changeAction(e) {
    e.preventDefault();
    this.props.edit();
  }
  removeContact(e) {
    e.preventDefault();
    fetch(API_ROOT + 'api/contacts/' + this.props.data.nick_name, {
      method: 'DELETE',
      headers: {
        "Authorization": AUTH
      }
    })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if(result.success){
        this.props.delete(this.props.data.nick_name);
      }
    });
  }
  render() {
    let phone = this.props.data.phone.map((p, i) => {
      return(
        <div className="phone-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    let email = this.props.data.email.map((p, i) => {
      return(
        <div className="email-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    let address = this.props.data.address.map((p, i) => {
      return(
        <div className="address-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    return(
      <div className="contact-detail">
        <div className="contact-description">
          <label>Name</label>
          <h3>{this.props.data.name}</h3>
          <label>Phone</label>
          { phone }
          <label>Title</label>
          <span>{this.props.data.title}</span>
          <label>Email</label>
          { email }
          <label>Address</label>
          { address }
          <label>Company</label>
          {this.props.data.company}
        </div>
        <div className="contact-action">
          <button onClick={this.changeAction}>Change</button><br/>
          <button onClick={this.removeContact}>Delete</button>
        </div>
      </div>
    );
  }
}

class Search extends React.Component {
  render() {
    return(
      <div className="search-bar">
        <input type="text" onChange={(e) => {e.preventDefault(); this.props.filter(e.target.value)}} placeholder="Search..." />
      </div>
    );
  }
}

class Add extends React.Component {
  constructor(props) {
    super(props);
    this.submitData = this.submitData.bind(this);
  }
  submitData(data) {
    fetch(API_ROOT + 'api/contacts/', {
      method: 'POST',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Authorization": AUTH
      },
      body: serialize(data)
    })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if(result.success){
        let nick = (data.nick_name)? data.nick_name:data.name.split(" ")[0];
        data.nick_name = nick;
        this.props.save(data);
      }
    });
  }
  render() {
    return(<Form save={this.submitData} />);
  }
}

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.submitData = this.submitData.bind(this);
  }
  submitData(data) {
    fetch(API_ROOT + 'api/contacts/' + data.nick_name, {
      method: 'PUT',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Authorization": AUTH
      },
      body: serialize(data)
    })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if(result.success){
        this.props.save(data.nick_name);
      }
    });
  }
  render() {
    return(<Form data={this.props.data} save={this.submitData} />);
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = (this.props.data)? this.props.data:DEFAULT_VALUE;
    this.sendData = this.sendData.bind(this);
    this.handleArray = this.handleArray.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }
  sendData(e) {
    e.preventDefault();
    this.props.save(this.state);
  }
  handleArray(e, key, i) {
    e.preventDefault();
    let data = this.state[key];
    let obj = {};
    data[i] = e.target.value;
    obj[key] = data;
    this.setState(obj);
  }
  addItem(e, key) {
    e.preventDefault();
    let data = this.state[key];
    let obj = {};
    if (data.length >= 5){
      // data = [""];
      console.log('Max nya 5 coy');
    } else {
      data.push("");
    }
    obj[key] = data;
    this.setState(obj);
  }
  removeItem(e, key, i) {
    e.preventDefault();
    let data = this.state[key];
    let obj = {};
    if (data.length <= 1){
      data = [""];
    } else {
      data.splice(i,1);
    }
    obj[key] = data;
    this.setState(obj);
  }
  render() {
    return(
      <div className="edit-form">
      <form onSubmit={this.sendData}>
          name:  <input type="text" onChange={ (e)=>this.setState({name: e.target.value}) } value={this.state.name} /><br />
          title: <input type="text" onChange={ (e)=>this.setState({title: e.target.value}) } value={this.state.title} /><br />
          email:
          <div className="input-group">
            {
              this.state.email.map((val,i) => {
                return(
                  <div className="input-group-item">
                    <input type="text" onChange={ (e)=> this.handleArray(e, 'email', i) } value={val} />
                    <button onClick={(e) => this.removeItem(e, 'email', i) }>x</button>
                  </div>
                );
              })
            }
            <button onClick={(e) => this.addItem(e, 'email') }>+</button>
          </div>
          phone:
          <div className="input-group">
            {
              this.state.phone.map((val,i) => {
                return(
                  <div className="input-group-item">
                    <input type="text" onChange={ (e)=> this.handleArray(e, 'phone', i) } value={val} />
                    <button onClick={(e) => this.removeItem(e, 'phone', i) }>x</button>
                  </div>
                );
              })
            }
            <button onClick={(e) => this.addItem(e, 'phone') }>+</button>
          </div>
          address:
          <div className="input-group">
            {
              this.state.address.map((val,i) => {
                return(
                  <div className="input-group-item">
                    <input type="text" onChange={ (e)=> this.handleArray(e, 'address', i) } value={val} />
                    <button onClick={(e) => this.removeItem(e, 'address', i) }>x</button>
                  </div>
                );
              })
            }
            <button onClick={(e) => this.addItem(e, 'address') }>+</button>
          </div>
          company:<input type="text" onChange={ (e)=>this.setState({company: e.target.value}) } value={this.state.company} /><br />
          <button>SIMPAN</button>
        </form>
      </div>
    );
  }
}

ReactDOM.render(
  <Router>
    <Route path="/" component={MainLayout}>
      <IndexRoute component={Home} />
      <Route path="/about" component={About} />
    </Route>
  </Router>
  , document.getElementById('app-container')
);
