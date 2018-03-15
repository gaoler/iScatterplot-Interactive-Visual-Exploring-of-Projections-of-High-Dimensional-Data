function result=alphahull()
points=[1.00,2.00;3.00,6.00;6.00,5.00]
r=5.0
x=points(:,1)
y=points(:,2)
x1=x
y1=y
r1=double(r)
shp=alphaShape(x1,y1,r1)
s=area(shp)
l=perimeter(shp)
result=[s,l]




