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

class App extends React.Component {
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
    let new_data = new Array(data).concat(old_data);
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
    // keyword = keyword.replace(/[^\w\s]/gi, '');
    keyword = keyword.replace(/\\/g, "\\\\");
    for (let i = 0; i < data.length; i++) {
      let regex = new RegExp((keyword), "gi");
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
      <div>
        <section className="main-content">
          <div className="container">
            <ContactContainer data={this.state.data} update={this.appendData} delete={this.sliceData} find={this.filterData} />
          </div>
        </section>
      </div>
    );
  }
}

class Home extends React.Component {
  render() {
    return(
      <div className="page-container">
        <h1 className="content-title">Contact Manager</h1>
        <div className="row sponsor">
          <h2 className="full">Yoo Broo!</h2>
        </div>
      </div>
    );
  }
}

class ContactContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: DEFAULT_VALUE,
      view: ''
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
        view: 'detail'
      });
    });
  }
  updateData(data) {
    this.props.update(data);
    this.viewDetail(data.nick_name);
    this.setState({
      view: 'detail'
    });
  }
  removeData(nick) {
    this.props.delete(nick);
    this.setState({ view: '' });
  }
  addData() {
    this.setState({ view: 'add' });
  }
  editData() {
    this.setState({ view: 'edit' });
  }
  saveData(nick){;
    this.viewDetail(nick);
    this.setState({ view: 'detail' });
  }
  searchData(keyword) {
    this.props.find(keyword);
    this.setState({ view: '' });
  }
  render() {
    let data_contact = this.props.data.map((contact, i) => {
      return(
        <Contact key={i} name={contact.name} company={contact.company} nick={contact.nick_name}
         view={this.viewDetail} />
      );
    });
    let view_content = () => {
      switch (this.state.view) {
        case 'add': return(<Add add={true} save={this.updateData} />);
        case 'detail': return(<Detail data={this.state.data} edit={this.editData} delete={this.removeData} />);
        case 'edit': return(<Edit data={this.state.data} save={this.saveData} />);
        default: return(<Home/>);

      }
    }
    return(
      <div className="contact-container">
        <div className="half contact-item-container">
          <div className="row search">
            <h2 className="full contact-title">All Contacts
              <span className="action" style={{ 'float': 'right' }} onClick={this.addData}><Icon name="plus"/></span>
            </h2>
            <Search filter={this.searchData} />
          </div>
          <div className="row contact-list">
            {data_contact}
          </div>
        </div>
        <div className="half contact-content-container">
          {view_content()}
        </div>
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
      <div onClick={this.pickContact} className="full contact-item">
        <h3 className="contact-name">{this.props.name}</h3>
        <p>{this.props.company}</p>
        <hr/>
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
    if (confirm(`Apa Kamu Yakin Mau menghapus ${this.props.data.name} ?`)) {
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
  }
  render() {
    let phone = this.props.data.phone.map((p, i) => {
      return(
        <div className="tree-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    let email = this.props.data.email.map((p, i) => {
      return(
        <div className="tree-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    let address = this.props.data.address.map((p, i) => {
      return(
        <div className="tree-item">
          <span key={i}>{p}</span><br/>
        </div>
      );
    });
    return(
      <div className="full contact-detail">
        <h1 className="content-title">Contact Detail</h1>
        <div className="contact-description">
          <div className="contact-detail-content">
            <label>Name</label>
            <div className="content">
              {this.props.data.name}
            </div>
          </div>
          <div className="contact-detail-content">
            <label>Phone</label>
            <div className="content">
              { phone }
            </div>
          </div>
          <div className="contact-detail-content">
            <label>Title</label>
            <div className="content">
              <span>{this.props.data.title}</span>
            </div>
          </div>
          <div className="contact-detail-content">
            <label>Email</label>
            <div className="content">
              { email }
            </div>
          </div>
          <div className="contact-detail-content">
            <label>Address</label>
            <div className="content">
              { address }
            </div>
          </div>
          <div className="contact-detail-content">
            <label>Company</label>
            <div className="content">
              {this.props.data.company}
            </div>
          </div>
        </div>
        <hr className="separator" />
        <div className="contact-action">
          <div className="row">
            <div className="half">
              <button className="btn btn-blue" onClick={this.changeAction}>Change</button>
            </div>
            <div className="half">
              <button className="btn btn-red" onClick={this.removeContact}>Delete</button>
            </div>
          </div>
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
    return(
      <div className="full">
        <h1 className="content-title">Add New Contact</h1>
        <Form add={true} save={this.submitData} />
      </div>
    );
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
    return(
      <div className="full">
        <h1 className="content-title">Edit Contact <i>{this.props.data.name}</i> </h1>
        <Form data={this.props.data} save={this.submitData} />
      </div>
    );
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = (this.props.data)? this.props.data:DEFAULT_VALUE;
    if (this.props.add) {
      this.state.email   = [""];
      this.state.phone   = [""];
      this.state.address = [""];
    }
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
    if (data.length >= 3){
      // data = [""];
      console.log('Max nya 3 coy');
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
      <form onSubmit={this.sendData} className="contact-form">
        <div className="input-group">
          <label>Name</label>
          <input type="text" onChange={ (e)=>this.setState({name: e.target.value}) } value={this.state.name} />
        </div>
        <div className="input-group">
          <label>Title</label>
          <input type="text" onChange={ (e)=>this.setState({title: e.target.value}) } value={this.state.title} />
        </div>
        <div className="input-group">
          <label>
            Email
            <span className="action" onClick={(e) => this.addItem(e, 'email') }><Icon name="plus"/></span>
          </label>
          {
            this.state.email.map((val,i) => {
              return(
                <div className="input-group-item">
                  <input type="email" onChange={ (e)=> this.handleArray(e, 'email', i) } value={val} />
                  <span className="action" onClick={(e) => this.removeItem(e, 'email', i) }><Icon name="remove"/></span>
                </div>
              );
            })
          }
        </div>
        <div className="input-group">
          <label>
            Phone
            <span className="action" onClick={(e) => this.addItem(e, 'phone') }><Icon name="plus"/></span>
          </label>
          {
            this.state.phone.map((val,i) => {
              return(
                <div className="input-group-item">
                  <input type="text" onChange={ (e)=> this.handleArray(e, 'phone', i) } value={val} />
                  <span className="action" onClick={(e) => this.removeItem(e, 'phone', i) }><Icon name="remove"/></span>
                </div>
              );
            })
          }
        </div>
        <div className="input-group">
          <label>
            Address
            <span className="action" onClick={(e) => this.addItem(e, 'address') }><Icon name="plus"/></span>
          </label>
          {
            this.state.address.map((val,i) => {
              return(
                <div className="input-group-item">
                  <textarea onChange={ (e)=> this.handleArray(e, 'address', i) } value={val} ></textarea>
                  <span className="action" onClick={(e) => this.removeItem(e, 'address', i) }><Icon name="remove"/></span>
                </div>
              );
            })
          }
        </div>
        <div className="input-group">
          <label>Company</label>
          <input type="text" onChange={ (e)=>this.setState({company: e.target.value}) } value={this.state.company} /><br />
        </div>
        <hr className="separator" />
        {/* <div style={{ 'marginLeft': '-30px', 'padding': '0px 20px' }}> */}
        <div className="row">
          <div className="half">
            <button className="btn btn-red" onClick={(e)=>{e.preventDefault(); this.setState(DEFAULT_VALUE)}}>Reset</button>
          </div>
          <div className="half">
            <button className="btn btn-blue">Simpan</button>
          </div>
        </div>
      </form>
    );
  }
}

class Icon extends React.Component {
  componentDidMount(){
    $('.action').on('click', function(e) {
      e.preventDefault();
      $(this).addClass('button-effect');
      var that = $(this);
      setTimeout(function () {
        that.removeClass('button-effect');
      }, 200);
    })
  }
  render() {
    return( <i className={ "fa fa-" + this.props.name }></i> );
  }
}

ReactDOM.render(<App />, document.getElementById('app-container'));
