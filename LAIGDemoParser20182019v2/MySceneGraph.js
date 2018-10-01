var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
    }


    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <SCENE>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");

            //Parse INITIAL block
            //if ((error = this.parseInitials(nodes[index])) != null)
                //return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            //if ((error = this.parseIllumination(nodes[index])) != null)
                //return error;
        }

        // <LIGHTS>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse LIGHTS block
            //if ((error = this.parseLights(nodes[index])) != null)
                //return error;
        }

        // <TEXTURES>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse TEXTURES block
            //if ((error = this.parseTextures(nodes[index])) != null)
                //return error;
        }

        // <MATERIALS>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse MATERIALS block
            //if ((error = this.parseMaterials(nodes[index])) != null)
                //return error;
        }

        // <Transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse NODES block
            //if ((error = this.parseNodes(nodes[index])) != null)
                //return error;
        }

        //<Primitives>
        if((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <Primitives> missing";
        else{
            if(index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");
            
            //Parse PRIMITIVES block 
            //if((error = this.parsePrimitives(nodes[index])) != null)
                //return error;
        }

        //<Components>
        if((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else{
            if(index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");
            
            //Parse COMPONENTS block 
            //if((error = this.parseComponents(nodes[index])) != null)
                //return error;
        }

    }

    /**
     * Parses the <INITIALS> block.
     */
    parseInitials(initialsNode) {

        var children = initialsNode.children;

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        // Frustum planes
        // (default values)
        this.near = 0.1;
        this.far = 500;
        var indexFrustum = nodeNames.indexOf("frustum");
        if (indexFrustum == -1) {
            this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
        }
        else {
            this.near = this.reader.getFloat(children[indexFrustum], 'near');
            this.far = this.reader.getFloat(children[indexFrustum], 'far');

            if (!(this.near != null && !isNaN(this.near))) {
                this.near = 0.1;
                this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
            }
            else if (!(this.far != null && !isNaN(this.far))) {
                this.far = 500;
                this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
            }

            if (this.near >= this.far)
                return "'near' must be smaller than 'far'";
        }

        // Checks if at most one translation, three rotations, and one scaling are defined.
        if (initialsNode.getElementsByTagName('translation').length > 1)
            return "no more than one initial translation may be defined";

        if (initialsNode.getElementsByTagName('rotation').length > 3)
            return "no more than three initial rotations may be defined";

        if (initialsNode.getElementsByTagName('scale').length > 1)
            return "no more than one scaling may be defined";

        // Initial transforms.
        this.initialTranslate = [];
        this.initialScaling = [];
        this.initialRotations = [];

        // Gets indices of each element.
        var translationIndex = nodeNames.indexOf("translation");
        var thirdRotationIndex = nodeNames.indexOf("rotation");
        var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
        var firstRotationIndex = nodeNames.lastIndexOf("rotation");
        var scalingIndex = nodeNames.indexOf("scale");

        // Checks if the indices are valid and in the expected order.
        // Translation.
        this.initialTransforms = mat4.create();
        mat4.identity(this.initialTransforms);

        if (translationIndex == -1)
            this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
        else {
            var tx = this.reader.getFloat(children[translationIndex], 'x');
            var ty = this.reader.getFloat(children[translationIndex], 'y');
            var tz = this.reader.getFloat(children[translationIndex], 'z');

            if (tx == null || ty == null || tz == null) {
                tx = 0;
                ty = 0;
                tz = 0;
                this.onXMLMinorError("failed to parse coordinates of initial translation; assuming zero");
            }

            mat4.translate(this.initialTransforms, this.initialTransforms, [tx, ty, tz]);
        }


        // Rotation
        if(firstRotationIndex == -1)
            this.onXMLMinorError("initial rotation undefined; assuming R = (x, 0, 0, 0)");
        else{
            var axisX = this.reader.getString(children[firstRotationIndex], "axis");
            var angleX = this.reader.getFloat(children[firstRotationIndex], "angle");

            if(axisX == null || angleX == null){
                axisX = 'x';
                angleX = 0;
                this.onXMLMinorError("failed to parse coordinates of initial rotation; assuming zero")
            }

            mat4.rotate(this.initialTransforms, this.initialTransforms, angleX, axisX);
        }

        if(secondRotationIndex == -1)
            this.onXMLMinorError("initial rotation undefined; assuming R = (y, 0, 0, 0)");
        else{
            var axisY = this.reader.getString(children[secondRotationIndex], "axis");
            var angleY = this.reader.getFloat(children[secondRotationIndex], "angle");

            if(axisY == null || angleY == null){
                axisY = 'x';
                angleY = 0;
                this.onXMLMinorError("failed to parse coordinates of initial rotation; assuming zero")
            }

            mat4.rotate(this.initialTransforms, this.initialTransforms, angleY, axisY);
        }

        if(thirdRotationIndex == -1)
            this.onXMLMinorError("initial rotation undefined; assuming R = (z, 0, 0, 0)");
        else{
            var axisZ = this.reader.getString(children[thirdRotationIndex], "axis");
            var angleZ = this.reader.getFloat(children[thirdRotationIndex], "angle");

            if(axisZ == null || angleZ == null){
                axisZ = 'x';
                angleZ = 0;
                this.onXMLMinorError("failed to parse coordinates of initial rotation; assuming zero")
            }

            mat4.rotate(this.initialTransforms, this.initialTransforms, angleZ, axisZ);
        }


        // Scale
        if (scalingIndex == -1)
            this.onXMLMinorError("initial scale undefined; assuming S = (1, 1, 1)");
        else {
            var sx = this.reader.getFloat(children[scalingIndex], "x");
            var sy = this.reader.getFloat(children[scalingIndex], "y");
            var sz = this.reader.getFloat(children[scalingIndex], "z");

            if (sx == null || sy == null || sz == null) {
                sx = 0;
                sy = 0;
                sz = 0;
                this.onXMLMinorError("failed to parse coordinates of initial scale; assuming one");
            }

            mat4.scale(this.initialTransforms, this.initialTransforms, [sx, sy, sz]);
        }


        //TODO: Parse Reference length
        // Reference Length
        this.axis = new CGFaxis(this, 1, 0.2);

        this.log("Parsed initials");

        return null;
    }

    /**
     * Parses the <ILLUMINATION> block.
     * @param {illumination block element} illuminationNode
     */
    parseIllumination(illuminationNode) {
        // TODO: Parse Illumination node

        this.log("Parsed illumination");

        return null;
    }


    /**
     * Parses the <LIGHTS> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {

        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Checks if those are valid types of lights
            if (children[i].nodeName != "omni" || children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            grandChildren = children[i].children;
            
            // Specifications for the current light.
            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // Gets indices of each element for both types of lights.
            var enableIndex = nodeNames.indexOf("enable");
            var locationIndex = nodeNames.indexOf("location");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");

            // Light enable/disable
            var enableLight = true;
            if (enableIndex == -1) {
                this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
            }
            else {
                var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
                if (!(aux != null && !isNaN(aux) && (aux == 0 || aux == 1)))
                    this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                else
                    enableLight = aux == 0 ? false : true;
            }

            // Retrieves "spot" lights extra components
            var angles = [];
            var exponents = [];
            if(children[i].nodeName == "spot"){

                // Gets indices of each element for the "spot" type of light.
                var angleIndex = nodeNames.indexOf("angle");
                var exponentIndex = nodeNames.indexOf("exponent");

                // Light angle
                if (angleIndex != -1) {

                    var angle = this.reader.getFloat(grandChildren[angleIndex], 'angle');
                    if (!(angle != null && !isNaN(angle) && angle >= 0 && angle <= 1))
                        return "unable to parse the angle for ID = " + lightId;
                    else
                        angles.push(angle);
                }
                else
                    return "angle undefined for ID = " + lightId;

                // Exponent angle
                if (exponentIndex != -1) {

                    var exponent = this.reader.getFloat(grandChildren[exponentIndex], 'exponent');
                    if (!(exponent != null && !isNaN(exponent) && exponent >= 0 && exponent <= 1))
                        return "unable to parse the exponent for ID = " + lightId;
                    else
                        exponents.push(exponent);
                }
                else
                    return "exponent undefined for ID = " + lightId;
            }


            // Retrieves the light location.
            var locationLight = [];
            if (locationIndex != -1) {
                // x
                var x = this.reader.getFloat(grandChildren[locationIndex], 'x');
                if (!(x != null && !isNaN(x)))
                    return "unable to parse x-coordinate of the light location for ID = " + lightId;
                else
                    locationLight.push(x);

                // y
                var y = this.reader.getFloat(grandChildren[locationIndex], 'y');
                if (!(y != null && !isNaN(y)))
                    return "unable to parse y-coordinate of the light location for ID = " + lightId;
                else
                    locationLight.push(y);

                // z
                var z = this.reader.getFloat(grandChildren[locationIndex], 'z');
                if (!(z != null && !isNaN(z)))
                    return "unable to parse z-coordinate of the light location for ID = " + lightId;
                else
                    locationLight.push(z);

                // w
                var w = this.reader.getFloat(grandChildren[locationIndex], 'w');
                if (!(w != null && !isNaN(w) && w >= 0 && w <= 1))
                    return "unable to parse w-coordinate of the light location for ID = " + lightId;
                else
                    locationLight.push(w);
            }
            else
                return "light location undefined for ID = " + lightId;


            // Retrieves the ambient component.
            var ambientIllumination = [];
            if (ambientIndex != -1) {
                // R
                var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
                if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
                    return "unable to parse R component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(r);

                // G
                var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
                if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
                    return "unable to parse G component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(g);

                // B
                var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
                if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
                    return "unable to parse B component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(b);

                // A
                var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
                if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
                    return "unable to parse A component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(a);
            }
            else
                return "ambient component undefined for ID = " + lightId;


            // Retrieves the diffuse component
            var difuseIllumination = [];
            if (difusetIndex != -1) {

                // R
                var r = this.reader.getFloat(grandChildren[difusetIndex], 'r');
                if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
                    return "unable to parse R component of the difuse illumination for ID = " + lightId;
                else
                    difuseIllumination.push(r);

                // G
                var g = this.reader.getFloat(grandChildren[difusetIndex], 'g');
                if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
                    return "unable to parse G component of the difuse illumination for ID = " + lightId;
                else
                    difuseIllumination.push(g);

                // B
                var b = this.reader.getFloat(grandChildren[difusetIndex], 'b');
                if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
                    return "unable to parse B component of the difuse illumination for ID = " + lightId;
                else
                    difuseIllumination.push(b);

                // A
                var a = this.reader.getFloat(grandChildren[difusetIndex], 'a');
                if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
                    return "unable to parse A component of the difuse illumination for ID = " + lightId;
                else
                    difuseIllumination.push(a);
            }
            else
                return "difuse component undefined for ID = " + lightId;


            // Retrieves the specular component
            var specularIllumination = [];
            if (specularIndex != -1) {

                // R
                var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
                if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
                    return "unable to parse R component of the specular illumination for ID = " + lightId;
                else
                    specularIllumination.push(r);

                // G
                var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
                if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
                    return "unable to parse G component of the specular illumination for ID = " + lightId;
                else
                    specularIllumination.push(g);

                // B
                var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
                if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
                    return "unable to parse B component of the specular illumination for ID = " + lightId;
                else
                    specularIllumination.push(b);

                // A
                var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
                if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
                    return "unable to parse A component of the specular illumination for ID = " + lightId;
                else
                    specularIllumination.push(a);
            }
            else
                return "specular component undefined for ID = " + lightId;


            // Stores Light global information.
            this.lights[lightId] = grandChildren;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");

        return null;
    }   

    /**
     * Parses the <TEXTURES> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        // TODO: Parse block

        console.log("Parsed textures");

        return null;
    }

    /**
     * Parses the <MATERIALS> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        // TODO: Parse block
        this.log("Parsed materials");
        return null;

    }

    /**
     * Parses the <NODES> block.
     * @param {nodes block element} nodesNode
     */
    parseNodes(nodesNode) {
        // TODO: Parse block
        this.log("Parsed nodes");
        return null;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
    }
}