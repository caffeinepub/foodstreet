import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";



actor {
  // Types
  public type RestaurantId = Nat;
  public type MenuItemId = Nat;
  public type OrderId = Nat;

  public type UserRole = AccessControl.UserRole;

  // Application-specific roles (stored separately from AccessControl roles)
  public type AppRole = {
    #customer;
    #restaurantOwner;
    #deliveryPartner;
    #admin;
  };

  public type RestaurantStatus = { #pending; #active; #suspended };
  public type OrderStatus = { #placed; #accepted; #preparing; #readyForPickup; #pickedUp; #delivered; #cancelled };

  public type UserProfile = {
    name : Text;
    appRole : AppRole;
    phone : Text;
    deliveryAddress : ?Text; // Optional, only for customers
    restaurantIds : [RestaurantId]; // For restaurant owners
    isApprovedDeliveryPartner : Bool; // New field
  };

  public type RestaurantProfile = {
    id : RestaurantId;
    owner : Principal;
    name : Text;
    cuisineType : Text;
    rating : Float;
    status : RestaurantStatus;
    address : Text;
    phone : Text;
  };

  public type MenuItem = {
    id : MenuItemId;
    restaurantId : RestaurantId;
    name : Text;
    description : Text;
    price : Float;
    isVeg : Bool;
    isAvailable : Bool;
    variants : [MenuItemVariant];
  };

  public type MenuItemVariant = {
    name : Text;
    price : Float;
  };

  public type CartItem = {
    menuItemId : MenuItemId;
    quantity : Nat;
  };

  public type Order = {
    id : OrderId;
    customer : Principal;
    restaurant : RestaurantId;
    items : [CartItem];
    totalPrice : Float;
    status : OrderStatus;
    deliveryPartner : ?Principal;
    createdAt : Time.Time;
  };

  public type Review = {
    customer : Principal;
    restaurant : RestaurantId;
    orderId : OrderId;
    rating : Float;
    comment : Text;
    createdAt : Time.Time;
  };

  module RestaurantProfile {
    public func compare(restaurant1 : RestaurantProfile, restaurant2 : RestaurantProfile) : Order.Order {
      switch (Text.compare(restaurant1.name, restaurant2.name)) {
        case (#equal) {
          switch (Text.compare(restaurant1.cuisineType, restaurant2.cuisineType)) {
            case (#equal) {
              Int.compare(restaurant1.id.toInt(), restaurant2.id.toInt());
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  module Review {
    public func compare(review1 : Review, review2 : Review) : Order.Order {
      switch (Text.compare(review1.comment, review2.comment)) {
        case (#equal) {
          Float.compare(review1.rating, review2.rating);
        };
        case (order) { order };
      };
    };
  };

  // State
  var nextRestaurantId = 1;
  var nextMenuItemId = 1;
  var nextOrderId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let restaurantProfiles = Map.empty<RestaurantId, RestaurantProfile>();
  let menuItems = Map.empty<MenuItemId, MenuItem>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<OrderId, Order>();
  let reviews = Map.empty<RestaurantId, List.List<Review>>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Approval component state
  let approvalState = UserApproval.initState(accessControlState);

  type PublicUserProfile = {
    id : Principal;
    name : Text;
    appRole : AppRole;
    isApprovedDeliveryPartner : Bool;
  };

  // Helper functions for app-specific role checks
  private func hasAppRole(caller : Principal, requiredRole : AppRole) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (requiredRole, profile.appRole) {
          case (#admin, #admin) { true };
          case (#restaurantOwner, #restaurantOwner) { true };
          case (#restaurantOwner, #admin) { true }; // Admins can act as restaurant owners
          case (#deliveryPartner, #deliveryPartner) { true };
          case (#deliveryPartner, #admin) { true }; // Admins can act as delivery partners
          case (#customer, #customer) { true };
          case (#customer, #admin) { true }; // Admins can act as customers
          case _ { false };
        };
      };
    };
  };

  private func isRestaurantOwner(caller : Principal, restaurantId : RestaurantId) : Bool {
    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { false };
      case (?restaurant) {
        restaurant.owner == caller or hasAppRole(caller, #admin)
      };
    };
  };

  private func isOrderCustomer(caller : Principal, orderId : OrderId) : Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        order.customer == caller or hasAppRole(caller, #admin)
      };
    };
  };

  private func hasDeliveredOrder(caller : Principal, restaurantId : RestaurantId) : Bool {
    for ((_, order) in orders.entries()) {
      if (order.customer == caller and order.restaurant == restaurantId and order.status == #delivered) {
        return true;
      };
    };
    false;
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Prevent self-assignment of admin app role
    if (profile.appRole == #admin and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot self assign admin profile");
    };

    // Prevent self-approval as delivery partner - only admins can approve
    if (profile.isApprovedDeliveryPartner and not AccessControl.isAdmin(accessControlState, caller)) {
      // Check if user is already approved
      switch (userProfiles.get(caller)) {
        case (?existingProfile) {
          // If already approved, allow keeping the approval status
          if (not existingProfile.isApprovedDeliveryPartner) {
            Runtime.trap("Unauthorized: Cannot self-approve as delivery partner");
          };
        };
        case (null) {
          // New profile cannot be created with approval
          Runtime.trap("Unauthorized: Cannot self-approve as delivery partner");
        };
      };
    };

    // For new delivery partner signups, ensure they start as unapproved
    let finalProfile = if (profile.appRole == #deliveryPartner and not AccessControl.isAdmin(accessControlState, caller)) {
      switch (userProfiles.get(caller)) {
        case (?existingProfile) {
          // Preserve existing approval status if already approved
          if (existingProfile.isApprovedDeliveryPartner) {
            profile
          } else {
            { profile with isApprovedDeliveryPartner = false }
          };
        };
        case (null) {
          // New delivery partner starts unapproved
          { profile with isApprovedDeliveryPartner = false }
        };
      };
    } else {
      profile
    };

    userProfiles.add(caller, finalProfile);
  };

  public query ({ caller }) func getPendingDeliveryPartners() : async [PublicUserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view pending delivery requests");
    };

    userProfiles.toArray().filter(
      func((id, profile)) {
        profile.appRole == #deliveryPartner and not profile.isApprovedDeliveryPartner
      }
    ).map(
      func((id, profile)) { { id; name = profile.name; appRole = #deliveryPartner; isApprovedDeliveryPartner = false } }
    );
  };

  public shared ({ caller }) func approveDeliveryPartner(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve delivery partners");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        if (profile.appRole != #deliveryPartner) {
          Runtime.trap("User does not have the delivery partner app role");
        };

        if (profile.isApprovedDeliveryPartner) {
          Runtime.trap("User is already approved as a delivery partner");
        };

        userProfiles.add(user, { profile with isApprovedDeliveryPartner = true });
      };
    };
  };

  // Add required user-approval component functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Restaurant Management
  public shared ({ caller }) func createRestaurant(profile : RestaurantProfile) : async RestaurantId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create restaurants");
    };

    if (not hasAppRole(caller, #restaurantOwner)) {
      Runtime.trap("Unauthorized: Only restaurant owners can create restaurants");
    };

    let id = nextRestaurantId;
    let restaurant = {
      profile with
      id;
      owner = caller;
      status = #pending;
      rating = 0.0;
    };
    restaurantProfiles.add(id, restaurant);
    nextRestaurantId += 1;

    // Update user profile to include this restaurant
    switch (userProfiles.get(caller)) {
      case (?userProfile) {
        let updatedRestaurantIds = userProfile.restaurantIds.concat([id]);
        userProfiles.add(caller, { userProfile with restaurantIds = updatedRestaurantIds });
      };
      case (null) {};
    };

    id;
  };

  public shared ({ caller }) func updateRestaurant(restaurantId : RestaurantId, name : Text, cuisineType : Text, address : Text, phone : Text) : async () {
    if (not isRestaurantOwner(caller, restaurantId)) {
      Runtime.trap("Unauthorized: Only restaurant owner can update restaurant");
    };

    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { Runtime.trap("Restaurant not found") };
      case (?restaurant) {
        let updated = {
          restaurant with
          name;
          cuisineType;
          address;
          phone;
        };
        restaurantProfiles.add(restaurantId, updated);
      };
    };
  };

  public shared ({ caller }) func addMenuItem(restaurantId : RestaurantId, item : MenuItem) : async MenuItemId {
    if (not isRestaurantOwner(caller, restaurantId)) {
      Runtime.trap("Unauthorized: Only restaurant owner can add menu items");
    };

    let id = nextMenuItemId;
    let menuItem = { item with id; restaurantId };
    menuItems.add(id, menuItem);
    nextMenuItemId += 1;
    id;
  };

  public shared ({ caller }) func updateMenuItem(menuItemId : MenuItemId, name : Text, description : Text, price : Float, isVeg : Bool, isAvailable : Bool, variants : [MenuItemVariant]) : async () {
    switch (menuItems.get(menuItemId)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        if (not isRestaurantOwner(caller, item.restaurantId)) {
          Runtime.trap("Unauthorized: Only restaurant owner can update menu items");
        };

        let updated = {
          item with
          name;
          description;
          price;
          isVeg;
          isAvailable;
          variants;
        };
        menuItems.add(menuItemId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(menuItemId : MenuItemId) : async () {
    switch (menuItems.get(menuItemId)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        if (not isRestaurantOwner(caller, item.restaurantId)) {
          Runtime.trap("Unauthorized: Only restaurant owner can delete menu items");
        };
        menuItems.remove(menuItemId);
      };
    };
  };

  // Admin-only: Approve restaurant
  public shared ({ caller }) func approveRestaurant(restaurantId : RestaurantId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve restaurants");
    };

    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { Runtime.trap("Restaurant not found") };
      case (?restaurant) {
        restaurantProfiles.add(restaurantId, { restaurant with status = #active });
      };
    };
  };

  // Admin-only: Suspend restaurant
  public shared ({ caller }) func suspendRestaurant(restaurantId : RestaurantId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can suspend restaurants");
    };

    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { Runtime.trap("Restaurant not found") };
      case (?restaurant) {
        restaurantProfiles.add(restaurantId, { restaurant with status = #suspended });
      };
    };
  };

  // Admin-only: Unsuspend restaurant
  public shared ({ caller }) func unsuspendRestaurant(restaurantId : RestaurantId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unsuspend restaurants");
    };

    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { Runtime.trap("Restaurant not found") };
      case (?restaurant) {
        restaurantProfiles.add(restaurantId, { restaurant with status = #active });
      };
    };
  };

  // Cart & Order Management
  public shared ({ caller }) func addToCart(menuItemId : MenuItemId, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can add to cart");
    };

    // Verify menu item exists
    switch (menuItems.get(menuItemId)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        if (not item.isAvailable) {
          Runtime.trap("Menu item is not available");
        };
      };
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    cart.add({ menuItemId; quantity });
    carts.add(caller, cart);
  };

  public shared ({ caller }) func removeFromCart(menuItemId : MenuItemId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can remove from cart");
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) {
        let filtered = cart.filter(func(item : CartItem) : Bool { item.menuItemId != menuItemId });
        carts.add(caller, filtered);
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can clear cart");
    };

    carts.remove(caller);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func placeOrder(restaurantId : RestaurantId) : async OrderId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can place orders");
    };

    // Verify restaurant exists and is active
    switch (restaurantProfiles.get(restaurantId)) {
      case (null) { Runtime.trap("Restaurant not found") };
      case (?restaurant) {
        if (restaurant.status != #active) {
          Runtime.trap("Restaurant is not accepting orders");
        };
      };
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?existingCart) {
        if (existingCart.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        existingCart;
      };
    };

    var total : Float = 0;
    let itemsArray = cart.toArray();
    for (item in itemsArray.values()) {
      switch (menuItems.get(item.menuItemId)) {
        case (null) { Runtime.trap("Menu item not found") };
        case (?menuItem) {
          if (menuItem.restaurantId != restaurantId) {
            Runtime.trap("All items must be from the same restaurant");
          };
          total += menuItem.price * item.quantity.toFloat();
        };
      };
    };

    let orderId = nextOrderId;
    let order = {
      id = orderId;
      customer = caller;
      restaurant = restaurantId;
      items = itemsArray;
      totalPrice = total;
      status = #placed;
      deliveryPartner = null;
      createdAt = Time.now();
    };
    orders.add(orderId, order);
    nextOrderId += 1;

    carts.remove(caller); // Clear cart after placing order
    orderId;
  };

  // Restaurant owner: Update order status
  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Restaurant owner can update to: accepted, preparing, readyForPickup, cancelled
        if (not isRestaurantOwner(caller, order.restaurant)) {
          Runtime.trap("Unauthorized: Only restaurant owner can update order status");
        };

        // Validate status transitions
        switch (status) {
          case (#accepted or #preparing or #readyForPickup or #cancelled) {
            orders.add(orderId, { order with status });
          };
          case _ {
            Runtime.trap("Invalid status transition for restaurant owner");
          };
        };
      };
    };
  };

  // Delivery partner: Accept order for delivery
  public shared ({ caller }) func acceptDelivery(orderId : OrderId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept deliveries");
    };

    if (not hasAppRole(caller, #deliveryPartner)) {
      Runtime.trap("Unauthorized: Only delivery partners can accept deliveries");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userProfile) {
        if (not userProfile.isApprovedDeliveryPartner) {
          Runtime.trap("Not approved as a delivery partner!");
        };
      };
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.status != #readyForPickup) {
          Runtime.trap("Order is not ready for pickup");
        };
        orders.add(orderId, { order with deliveryPartner = ?caller });
      };
    };
  };

  // Delivery partner: Update delivery status
  public shared ({ caller }) func updateDeliveryStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update delivery status");
    };

    if (not hasAppRole(caller, #deliveryPartner)) {
      Runtime.trap("Unauthorized: Only delivery partners can update delivery status");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userProfile) {
        if (not userProfile.isApprovedDeliveryPartner) {
          Runtime.trap("Not approved as a delivery partner!");
        };
      };
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (order.deliveryPartner) {
          case (null) { Runtime.trap("No delivery partner assigned") };
          case (?partner) {
            if (partner != caller and not hasAppRole(caller, #admin)) {
              Runtime.trap("Unauthorized: Only assigned delivery partner can update status");
            };

            // Validate status transitions for delivery partner
            switch (status) {
              case (#pickedUp or #delivered) {
                orders.add(orderId, { order with status });
              };
              case _ {
                Runtime.trap("Invalid status transition for delivery partner");
              };
            };
          };
        };
      };
    };
  };

  // Review Management
  public shared ({ caller }) func addReview(restaurantId : RestaurantId, orderId : OrderId, rating : Float, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can add reviews");
    };

    // Verify order exists and belongs to caller
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customer != caller) {
          Runtime.trap("Unauthorized: Can only review your own orders");
        };
        if (order.restaurant != restaurantId) {
          Runtime.trap("Order does not belong to this restaurant");
        };
        if (order.status != #delivered) {
          Runtime.trap("Can only review delivered orders");
        };
      };
    };

    // Check if review already exists for this order
    switch (reviews.get(restaurantId)) {
      case (?existingReviews) {
        for (review in existingReviews.values()) {
          if (review.orderId == orderId) {
            Runtime.trap("Review already exists for this order");
          };
        };
      };
      case (null) {};
    };

    let existingReviews = switch (reviews.get(restaurantId)) {
      case (null) { List.empty<Review>() };
      case (?existing) { existing };
    };

    let review = {
      customer = caller;
      restaurant = restaurantId;
      orderId;
      rating;
      comment;
      createdAt = Time.now();
    };
    existingReviews.add(review);
    reviews.add(restaurantId, existingReviews);

    // Update restaurant rating
    updateRestaurantRating(restaurantId);
  };

  private func updateRestaurantRating(restaurantId : RestaurantId) {
    switch (reviews.get(restaurantId)) {
      case (null) {};
      case (?restaurantReviews) {
        var totalRating : Float = 0;
        var count : Nat = 0;
        for (review in restaurantReviews.values()) {
          totalRating += review.rating;
          count += 1;
        };
        if (count > 0) {
          let avgRating = totalRating / count.toFloat();
          switch (restaurantProfiles.get(restaurantId)) {
            case (?restaurant) {
              restaurantProfiles.add(restaurantId, { restaurant with rating = avgRating });
            };
            case (null) {};
          };
        };
      };
    };
  };

  // Queries - Public (no auth needed for browsing)
  public query func getRestaurant(restaurantId : RestaurantId) : async ?RestaurantProfile {
    restaurantProfiles.get(restaurantId);
  };

  public query func getAllRestaurants() : async [RestaurantProfile] {
    restaurantProfiles.values().toArray().filter(func(r : RestaurantProfile) : Bool { r.status == #active });
  };

  public query func getMenuItems(restaurantId : RestaurantId) : async [MenuItem] {
    menuItems.values().toArray().filter(
      func(item) { item.restaurantId == restaurantId }
    );
  };

  public query func searchRestaurants(searchTerm : Text) : async [RestaurantProfile] {
    let term = searchTerm.toLower();
    restaurantProfiles.values().toArray().filter(
      func(restaurant) {
        restaurant.status == #active and (restaurant.name.toLower().contains(#text term) or restaurant.cuisineType.toLower().contains(#text term))
      }
    );
  };

  public query func getRestaurantReviews(restaurantId : RestaurantId) : async [Review] {
    switch (reviews.get(restaurantId)) {
      case (null) { [] };
      case (?existingReviews) { existingReviews.toArray().sort() };
    };
  };

  // Authenticated queries - Customer orders
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    if (not hasAppRole(caller, #customer)) {
      Runtime.trap("Unauthorized: Only customers can view their orders");
    };

    orders.values().toArray().filter(func(order : Order) : Bool { order.customer == caller });
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async ?Order {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        // Customer can view their own orders
        if (order.customer == caller) {
          return ?order;
        };
        // Restaurant owner can view orders for their restaurant
        if (isRestaurantOwner(caller, order.restaurant)) {
          return ?order;
        };
        // Delivery partner can view assigned orders
        switch (order.deliveryPartner) {
          case (?partner) {
            if (partner == caller) {
              return ?order;
            };
          };
          case (null) {};
        };
        // Admin can view all orders
        if (hasAppRole(caller, #admin)) {
          return ?order;
        };
        Runtime.trap("Unauthorized: Cannot view this order");
      };
    };
  };

  // Restaurant owner queries
  public query ({ caller }) func getRestaurantOrders(restaurantId : RestaurantId) : async [Order] {
    if (not isRestaurantOwner(caller, restaurantId)) {
      Runtime.trap("Unauthorized: Only restaurant owner can view restaurant orders");
    };

    orders.values().toArray().filter(func(order : Order) : Bool { order.restaurant == restaurantId });
  };

  public query ({ caller }) func getMyRestaurants() : async [RestaurantProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view restaurants");
    };

    if (not hasAppRole(caller, #restaurantOwner)) {
      Runtime.trap("Unauthorized: Only restaurant owners can view their restaurants");
    };

    restaurantProfiles.values().toArray().filter(func(r : RestaurantProfile) : Bool { r.owner == caller });
  };

  // Delivery partner queries
  public query ({ caller }) func getAvailableDeliveries() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view deliveries");
    };

    if (not hasAppRole(caller, #deliveryPartner)) {
      Runtime.trap("Unauthorized: Only delivery partners can view available deliveries");
    };

    orders.values().toArray().filter(func(order : Order) : Bool {
      order.status == #readyForPickup and order.deliveryPartner == null
    });
  };

  public query ({ caller }) func getMyDeliveries() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view deliveries");
    };

    if (not hasAppRole(caller, #deliveryPartner)) {
      Runtime.trap("Unauthorized: Only delivery partners can view their deliveries");
    };

    orders.values().toArray().filter(func(order : Order) : Bool {
      switch (order.deliveryPartner) {
        case (?partner) { partner == caller };
        case (null) { false };
      };
    });
  };

  // Admin queries
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public query ({ caller }) func getPendingRestaurants() : async [RestaurantProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view pending restaurants");
    };

    restaurantProfiles.values().toArray().filter(func(r : RestaurantProfile) : Bool { r.status == #pending });
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().toArray();
  };
};
