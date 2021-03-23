import React, { Component } from "react";
import axios from "axios";
import FileBase64 from "react-file-base64";
import {
  Form,
  FormGroup,
  Label,
  FormText,
  Input,
  Col,
  Button,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./upload.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import * as uuid from "uuid";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmation: "",
      isLoading: "",
      files: "",
      StyleCode: "",
      Link: "",
      title: "",
      brandName: "",
      color: "",
      depertment: "",
      material: "",
      model: "",

      productDetails: {},
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleManualSearch = this.handleManualSearch.bind(this);
    this.handleProductDetailChange = this.handleProductDetailChange.bind(this);
    this.handleManualSearchLink = this.handleManualSearchLink.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  async handleSubmit(event) {
    event.preventDefault();
    this.state({ confirmation: "uploading ..." });
  }
  async getFiles(files) {
    this.setState({
      isLoading: "Extracting the style/model code ...",
      files: files,
    });

    const UID = uuid.v4();
    var data = {
      fileExt: "png",
      imageID: UID,
      folder: UID,
      img: this.state.files[0].base64,
    };
    this.setState({ confirmation: "processing label..." });
    await fetch(
      "https://72g4w9woch.execute-api.us-east-2.amazonaws.com/production",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(data),
      }
    );

    const targetImage = '"' + UID + '"' + ".png";
    console.log("Image name: " + targetImage);
    const response = await fetch(
      " https://72g4w9woch.execute-api.us-east-2.amazonaws.com/production/ocr",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(targetImage),
      }
    );
    this.setState({ confirmation: "" });
    const ocrBody = await response.json();
    console.log("data from lambda function: ");
    console.log(ocrBody);
    this.setState({ StyleCode: ocrBody.body });

    var dbURL = "http://localhost:3000/product/" + ocrBody.body;
    console.log("db url: " + dbURL);
    this.setState({ confirmation: "fetching data from database ...." });
    await fetch(dbURL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          this.setState({ productDetails: data[0] });
        } else {
          console.log("failed");
          this.setState({
            confirmation: "No data found for given style code...",
          });
        }
      });
  }

  async handleManualSearch() {
    try {
      this.setState({
        confirmation: "fetching data from database ....",
        productDetails: {},
      });
      const styleCode = this.state.StyleCode;
      const res = await axios.get(
        `http://localhost:3000/product/${styleCode}`,
        {
          headers: {
            Accept: "application/json",
            "Content-type": "application.json",
          },
        }
      );
      if (res.data.length > 0) {
        const productDetails = res.data[0];
        this.setState({ productDetails });
        this.setState({ confirmation: "" });
      } else {
        this.setState({ confirmation: "No data found" });
      }
    } catch (err) {
      this.setState({ confirmation: "Error: Unable to fetch data." });
    }
  }

  async handleManualSearchLink() {
    try {
      this.setState({
        confirmation: "fetching data from database ....",
        productDetails: {},
      });
      const link = this.state.Link;
      const res = await fetch(
        "https://72g4w9woch.execute-api.us-east-2.amazonaws.com/production/fetchlink",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application.json",
          },
          body: JSON.stringify(link),
        }
      );
      const urlData = await res.json();
      if (urlData.data) {
        const productDetails = urlData.data;
        this.setState({ productDetails });
        this.setState({ confirmation: "" });
      } else {
        this.setState({ confirmation: "No data found" });
      }
    } catch (err) {
      this.setState({ confirmation: "Error: Unable to fetch data." });
    }
  }
  handleProductDetailChange(e) {
    const { name: key, value } = e.target,
      { productDetails } = this.state;
    productDetails[key] = value;
    this.setState({ productDetails });
  }

  render() {
    const { productDetails, confirmation: processing } = this.state;
    return (
      <div className="row">
        <div className="col-6 offset-3">
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <h3 className="text-danger">{processing}</h3>
              <h6>Upload Lable</h6>
              <FormText color="muted">PNG,JPG</FormText>

              <div className="form-group files color">
                <FileBase64
                  multiple={true}
                  onDone={this.getFiles.bind(this)}
                ></FileBase64>
              </div>
            </FormGroup>
          </Form>

          <Form onSubmit={this.handleManualSearch}>
            <div>
              <Label>
                <h6>Style Code</h6>
              </Label>
              <div className="row">
                <Col sm={10}>
                  <Input
                    type="text"
                    name="StyleCode"
                    id="manualStyleCode"
                    placeholder="Enter a style code."
                    required
                    value={this.state.StyleCode}
                    onChange={this.handleChange}
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    outline
                    color="secondary"
                    onClick={this.handleManualSearch}
                  >
                    Search
                  </Button>
                </Col>
              </div>
            </div>
          </Form>
          <Form>
            <div>
              <Label>
                <h6>Ebay Link</h6>
              </Label>
              <div className="row">
                <Col sm={10}>
                  <Input
                    type="text"
                    name="Link"
                    id="manualStyleCode"
                    placeholder="Enter ebay Link."
                    required
                    value={this.state.Link}
                    onChange={this.handleChange}
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    outline
                    color="secondary"
                    onClick={this.handleManualSearchLink}
                  >
                    Search
                  </Button>
                </Col>
              </div>
            </div>
          </Form>

          <Form>
            {Object.keys(productDetails).length > 0 &&
              Object.keys(productDetails).map((key, idx) => {
                if (
                  productDetails[key] &&
                  productDetails[key] !== "" &&
                  productDetails[key] !== NaN &&
                  productDetails[key] !== "nan"
                ) {
                  return (
                    <FormGroup key={idx}>
                      <Label>
                        <h6>{key}</h6>
                      </Label>
                      <Input
                        type="text"
                        name="material"
                        id="material"
                        required
                        name={key}
                        value={productDetails[key]}
                        onChange={this.handleProductDetailChange}
                      />
                    </FormGroup>
                  );
                } else return "";
              })}
          </Form>
        </div>
      </div>
    );
  }
}
export default Upload;
